package com.internetserviceprovider.chatbot.dto;

import java.util.List;
import lombok.Data;

@Data
public class GeminiResponse {
    private List<Candidate> candidates;

    @Data
    public static class Candidate {
        private Content content;

        @Data
        public static class Content {
            private List<Part> parts;
            private String role;
        }
    }

    @Data
    public static class Part {
        private String text;
    }
}
