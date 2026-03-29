package sway.debug;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Debug session NDJSON logger (writes to workspace root debug-ba3162.log).
 */
public final class DebugNdjsonLogger {

	private static final String SESSION_ID = "ba3162";
	private static final Object LOCK = new Object();

	private DebugNdjsonLogger() {
	}

	public static Path resolveLogFile() {
		String override = System.getProperty("sway.debug.log");
		if (override != null && !override.isBlank()) {
			return Paths.get(override).toAbsolutePath().normalize();
		}
		Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Path cursor = cwd;
		for (int i = 0; i < 10 && cursor != null; i++) {
			if (Files.isRegularFile(cursor.resolve("docker-compose.yml"))) {
				return cursor.resolve("debug-ba3162.log").toAbsolutePath().normalize();
			}
			cursor = cursor.getParent();
		}
		Path logFile = "backend".equalsIgnoreCase(String.valueOf(cwd.getFileName()))
				? cwd.resolveSibling("debug-ba3162.log")
				: cwd.resolve("debug-ba3162.log");
		return logFile.toAbsolutePath().normalize();
	}

	public static void log(String hypothesisId, String location, String message, Map<String, Object> data) {
		long ts = System.currentTimeMillis();
		String dataJson = data == null || data.isEmpty()
				? "{}"
				: data.entrySet().stream()
						.map(e -> "\"" + escapeJson(e.getKey()) + "\":\"" + escapeJson(String.valueOf(e.getValue())) + "\"")
						.collect(Collectors.joining(",", "{", "}"));
		String line = String.format(
				"{\"sessionId\":\"%s\",\"hypothesisId\":\"%s\",\"location\":\"%s\",\"message\":\"%s\",\"data\":%s,\"timestamp\":%d}%n",
				escapeJson(SESSION_ID),
				escapeJson(hypothesisId),
				escapeJson(location),
				escapeJson(message),
				dataJson,
				ts);
		synchronized (LOCK) {
			try {
				Path p = resolveLogFile();
				Path parent = p.getParent();
				if (parent != null) {
					Files.createDirectories(parent);
				}
				Files.writeString(p, line, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
			} catch (Exception e) {
				System.err.println("[debug-ba3162] log write failed: " + e.getMessage() + " (resolved=" + resolveLogFile() + ")");
			}
		}
	}

	private static String escapeJson(String s) {
		if (s == null) {
			return "";
		}
		return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
	}
}
