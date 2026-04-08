package com.internetserviceprovider.chatbot.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.internetserviceprovider.chatbot.model.ChatRequest;
import com.internetserviceprovider.chatbot.model.ChatResponse;
import com.internetserviceprovider.chatbot.service.ChatbotService;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest chatRequest) {
        String response = chatbotService.getChatResponse(chatRequest.getMessage());
        return new ChatResponse(response);
    }
}
