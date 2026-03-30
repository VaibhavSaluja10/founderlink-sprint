package org.capgemini.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    // Startup Events
    public static final String STARTUP_EXCHANGE = "startup_exchange";
    public static final String STARTUP_QUEUE = "notification_startup_queue";
    public static final String STARTUP_ROUTING_KEY = "startup.#";

    // Investment Events
    public static final String INVESTMENT_EXCHANGE = "investment_exchange";
    public static final String INVESTMENT_QUEUE = "notification_investment_queue";
    public static final String INVESTMENT_ROUTING_KEY = "investment.created";

    // Team Events
    public static final String TEAM_EXCHANGE = "team_exchange";
    public static final String TEAM_QUEUE = "notification_team_queue";
    public static final String TEAM_ROUTING_KEY = "team.invite.sent";

    @Bean
    public TopicExchange startupExchange() { return new TopicExchange(STARTUP_EXCHANGE); }
    @Bean
    public Queue startupQueue() { return new Queue(STARTUP_QUEUE); }
    @Bean
    public Binding startupBinding(Queue startupQueue, TopicExchange startupExchange) {
        return BindingBuilder.bind(startupQueue).to(startupExchange).with(STARTUP_ROUTING_KEY);
    }

    @Bean
    public TopicExchange investmentExchange() { return new TopicExchange(INVESTMENT_EXCHANGE); }
    @Bean
    public Queue investmentQueue() { return new Queue(INVESTMENT_QUEUE); }
    @Bean
    public Binding investmentBinding(Queue investmentQueue, TopicExchange investmentExchange) {
        return BindingBuilder.bind(investmentQueue).to(investmentExchange).with(INVESTMENT_ROUTING_KEY);
    }

    @Bean
    public TopicExchange teamExchange() { return new TopicExchange(TEAM_EXCHANGE); }
    @Bean
    public Queue teamQueue() { return new Queue(TEAM_QUEUE); }
    @Bean
    public Binding teamBinding(Queue teamQueue, TopicExchange teamExchange) {
        return BindingBuilder.bind(teamQueue).to(teamExchange).with(TEAM_ROUTING_KEY);
    }

    @Bean
    public MessageConverter converter() {
        return new Jackson2JsonMessageConverter();
    }
}
