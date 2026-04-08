package com.internetserviceprovider.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.internetserviceprovider.chatbot.dto.GeminiRequest;
import com.internetserviceprovider.chatbot.dto.GeminiResponse;
import java.util.Collections;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model.id}")
    private String modelId;

    @Autowired
    private RestTemplate restTemplate;

    private String getGeminiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + apiKey;
    }

    public String getChatResponse(String message) {
        try {
            String prompt = "You are a customer service chatbot for an internet service provider. Follow these rules strictly:\n" +
                "1. Assist users with internet services, connectivity problems, billing inquiries, and related topics only\n" +
                "2. Never use asterisks (*) or any markdown formatting in your responses\n" +
                "3. Use plain text only\n" +
                "4. Present questions in a simple bullet point format using dashes (-) instead of asterisks\n" +
                "5. Maintain a professional, helpful tone\n" +
                "6. If asking multiple questions, simply list them with numbers (1., 2., etc.)\n\n" +
                "User: " + message + "\nChatbot:";
            
            GeminiRequest.Part part = new GeminiRequest.Part(prompt);
            GeminiRequest.Content content = new GeminiRequest.Content(Collections.singletonList(part));
            GeminiRequest request = new GeminiRequest(Collections.singletonList(content));

            System.out.println("Sending request to Gemini API...");
            GeminiResponse response = restTemplate.postForObject(getGeminiUrl(), request, GeminiResponse.class);
            
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                GeminiResponse.Candidate.Content responseContent = response.getCandidates().get(0).getContent();
                if (responseContent != null && responseContent.getParts() != null && !responseContent.getParts().isEmpty()) {
                    String result = responseContent.getParts().get(0).getText();
                    // Clean up all markdown-style formatting
                    result = result
                        .replaceAll("\\*\\*([^*]+)\\*\\*", "$1") // Replace **text** with text
                        .replaceAll("\\*([^*]+)\\*", "$1")       // Replace *text* with text
                        .replaceAll("`([^`]+)`", "$1")           // Replace `text` with text
                        .replaceAll("__([^_]+)__", "$1")         // Replace __text__ with text
                        .replaceAll("~~([^~]+)~~", "$1")         // Replace ~~text~~ with text
                        .replaceAll("\\[(.*?)\\]\\(.*?\\)", "$1")// Remove links but keep text
                        .replaceAll("\\*", "")                   // Remove any remaining single asterisks
                        .replaceAll("\\s+\\*\\s+", "\n- ")       // Convert bullet points to dashes
                        .trim();
                    
                    System.out.println("Cleaned response from Gemini API: " + result);
                    return result;
                }
            }
            System.out.println("No valid response received from Gemini API");
            return "Sorry, I could not generate a response.";
            
        } catch (Exception e) {
            System.err.println("Error in ChatbotService: " + e.getMessage());
            e.printStackTrace();
            return "Sorry, I'm having trouble connecting to the server. Please try again later.";
        }
    }
}
