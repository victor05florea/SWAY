package sway.debug;

import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.boot.context.event.ApplicationFailedEvent;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

// #region agent log
@Component
public class DebugStartupListeners {

	@Component
	static class OnReady implements ApplicationListener<ApplicationReadyEvent> {
		@Override
		public void onApplicationEvent(ApplicationReadyEvent event) {
			Map<String, Object> d = new HashMap<>();
			d.put("phase", "ready");
			DebugNdjsonLogger.log("H2", "DebugStartupListeners.OnReady", "application_ready", d);
		}
	}

	@Component
	static class OnFailed implements ApplicationListener<ApplicationFailedEvent> {
		@Override
		public void onApplicationEvent(ApplicationFailedEvent event) {
			Throwable ex = event.getException();
			Map<String, Object> d = new HashMap<>();
			d.put("phase", "failed");
			d.put("exceptionClass", ex != null ? ex.getClass().getName() : "null");
			String msg = ex != null && ex.getMessage() != null ? ex.getMessage() : "";
			if (msg.length() > 800) {
				msg = msg.substring(0, 800) + "...";
			}
			d.put("exceptionMessage", msg);
			DebugNdjsonLogger.log("H1", "DebugStartupListeners.OnFailed", "application_failed", d);
		}
	}

	@Component
	static class OnContextRefreshed implements ApplicationListener<ContextRefreshedEvent> {
		@Override
		public void onApplicationEvent(ContextRefreshedEvent event) {
			if (event.getApplicationContext().getParent() != null) {
				return;
			}
			Map<String, Object> d = new HashMap<>();
			d.put("phase", "context_refreshed_root");
			DebugNdjsonLogger.log("H3", "DebugStartupListeners.OnContextRefreshed", "context_refreshed", d);
		}
	}
}
// #endregion
