package sway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@EnableCaching
public class BackendApplication {
	public static void main(String[] args) {
		// #region agent log
		Map<String, Object> startData = new HashMap<>();
		startData.put("userDir", System.getProperty("user.dir"));
		startData.put("javaVersion", System.getProperty("java.version"));
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
			throw t;
		}
	}
}
