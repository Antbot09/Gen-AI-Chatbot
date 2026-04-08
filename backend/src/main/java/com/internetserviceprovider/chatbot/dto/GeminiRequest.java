package com.internetserviceprovider.chatbot.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GeminiRequest {
    private List<Content> contents;

    @Data
    @AllArgsConstructor
    public static class Content {
        private List<Part> parts;
    }

    @Data
    @AllArgsConstructor
    public static class Part {
        private String text;
    }
}
