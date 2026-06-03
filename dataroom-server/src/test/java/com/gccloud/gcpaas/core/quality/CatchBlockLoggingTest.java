package com.gccloud.gcpaas.core.quality;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

class CatchBlockLoggingTest {

    @Test
    void loginUserUtilsIsExcludedFromCatchBlockLoggingRule() {
        assertTrue(isExcludedSource(Path.of("dataroom-server/src/main/java/com/gccloud/gcpaas/core/util/LoginUserUtils.java")));
    }

    @Test
    void catchBlocksLogOrPrintExceptions() throws IOException {
        List<String> violations = new ArrayList<>();
        for (Path sourceRoot : resolveSourceRoots()) {
            try (Stream<Path> javaFiles = Files.walk(sourceRoot)) {
                javaFiles
                        .filter(path -> path.toString().endsWith(".java"))
                        .filter(path -> !isExcludedSource(path))
                        .forEach(path -> collectViolations(path, violations));
            }
        }
        assertTrue(violations.isEmpty(), () -> "Catch blocks must log or print exceptions:\n"
                + String.join("\n", violations));
    }

    private void collectViolations(Path path, List<String> violations) {
        try {
            String source = Files.readString(path);
            int searchFrom = 0;
            while (searchFrom < source.length()) {
                int catchIndex = findNextCatchKeyword(source, searchFrom);
                if (catchIndex < 0) {
                    return;
                }
                int openBrace = source.indexOf('{', catchIndex);
                if (openBrace < 0) {
                    return;
                }
                int closeBrace = findMatchingBrace(source, openBrace);
                if (closeBrace < 0) {
                    return;
                }
                String catchBlock = source.substring(openBrace + 1, closeBrace);
                if (!hasExceptionOutput(catchBlock)) {
                    int line = lineNumber(source, catchIndex);
                    violations.add(path + ":" + line);
                }
                searchFrom = closeBrace + 1;
            }
        } catch (IOException e) {
            System.err.println(ExceptionUtils.getStackTrace(e));
            throw new IllegalStateException("Failed to read " + path, e);
        }
    }

    private boolean hasExceptionOutput(String catchBlock) {
        return catchBlock.contains("log.")
                || catchBlock.contains("ExceptionUtils.getStackTrace(")
                || catchBlock.contains(".printStackTrace(")
                || catchBlock.contains("System.err.")
                || catchBlock.contains("System.out.");
    }

    private int findNextCatchKeyword(String source, int searchFrom) {
        int catchIndex = source.indexOf("catch", searchFrom);
        while (catchIndex >= 0) {
            boolean beforeBoundary = catchIndex == 0 || !Character.isJavaIdentifierPart(source.charAt(catchIndex - 1));
            int afterIndex = catchIndex + "catch".length();
            boolean afterBoundary = afterIndex >= source.length() || !Character.isJavaIdentifierPart(source.charAt(afterIndex));
            if (beforeBoundary && afterBoundary && isCatchStatement(source, afterIndex)) {
                return catchIndex;
            }
            catchIndex = source.indexOf("catch", catchIndex + "catch".length());
        }
        return -1;
    }

    private boolean isCatchStatement(String source, int afterKeywordIndex) {
        int index = afterKeywordIndex;
        while (index < source.length() && Character.isWhitespace(source.charAt(index))) {
            index++;
        }
        return index < source.length() && source.charAt(index) == '(';
    }

    private List<Path> resolveSourceRoots() {
        List<Path> roots = new ArrayList<>();
        for (Path sourceRoot : List.of(Path.of("src/main/java"), Path.of("src/test/java"))) {
            if (Files.isDirectory(sourceRoot)) {
                roots.add(sourceRoot);
            }
        }
        if (!roots.isEmpty()) {
            return roots;
        }
        for (Path sourceRoot : List.of(Path.of("dataroom-server/src/main/java"), Path.of("dataroom-server/src/test/java"))) {
            if (Files.isDirectory(sourceRoot)) {
                roots.add(sourceRoot);
            }
        }
        return roots;
    }

    private boolean isExcludedSource(Path path) {
        return path.toString().replace('\\', '/').endsWith("com/gccloud/gcpaas/core/util/LoginUserUtils.java");
    }

    private int findMatchingBrace(String source, int openBrace) {
        int depth = 0;
        for (int i = openBrace; i < source.length(); i++) {
            char c = source.charAt(i);
            if (c == '{') {
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    private int lineNumber(String source, int offset) {
        int line = 1;
        for (int i = 0; i < offset; i++) {
            if (source.charAt(i) == '\n') {
                line++;
            }
        }
        return line;
    }
}
