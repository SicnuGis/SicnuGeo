package com.sicnu.geo.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfiguration {
    @Autowired
    ChatMemory chatMemory;

    @Bean
    public ChatClient chatClient(OpenAiChatModel model){
        return ChatClient
                .builder(model)
                .defaultSystem("你是城市共享愿景的ai助手小成，为你提供专业的地理信息服务")
                .defaultAdvisors(
                        new SimpleLoggerAdvisor(),
                         MessageChatMemoryAdvisor.builder(chatMemory)
                            .build()
                )
                .build();
    }

}
