package sway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import sway.debug.DebugNdjsonLogger;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class BackendApplication {
	public static void main(String[] args) {
		// #region agent log
		Map<String, Object> startData = new HashMap<>();
		startData.put("userDir", System.getProperty("user.dir"));
		startData.put("javaVersion", System.getProperty("java.version"));
		startData.put("logFile", DebugNdjsonLogger.resolveLogFile().toString());
		DebugNdjsonLogger.log("H0", "BackendApplication.main", "main_enter", startData);
		// #endregion
		try {
			SpringApplication.run(BackendApplication.class, args);
		} catch (Throwable t) {
			// #region agent log
			Map<String, Object> err = new HashMap<>();
			err.put("throwableClass", t.getClass().getName());
			String m = t.getMessage() != null ? t.getMessage() : "";
			if (m.length() > 800) {
				m = m.substring(0, 800) + "...";
			}
			err.put("throwableMessage", m);
			DebugNdjsonLogger.log("H5", "BackendApplication.main", "main_caught_throwable", err);
			// #endregion
			throw t;
		}
	}
}
