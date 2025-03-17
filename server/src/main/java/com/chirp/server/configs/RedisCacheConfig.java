package com.chirp.server.configs;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisCacheConfig {

	@Bean
	public RedisConnectionFactory redisConnectionFactory(
			@Value("${spring.data.redis.host}") String host ,
			@Value("${spring.data.redis.port}") int port ,
			@Value("${spring.data.redis.timeout}") long timeout) {

		RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
		redisConfig.setHostName(host);
		redisConfig.setPort(port);

		LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
				.commandTimeout(Duration.ofMillis(timeout))
				.build();

		return new LettuceConnectionFactory(redisConfig , clientConfig);
	}

	@Bean
	public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.registerModule(new JavaTimeModule());
		objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		objectMapper.activateDefaultTyping(
				objectMapper.getPolymorphicTypeValidator() ,
				ObjectMapper.DefaultTyping.NON_FINAL ,
				JsonTypeInfo.As.PROPERTY
		);

		GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(objectMapper);

		RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
				.entryTtl(Duration.ofMinutes(10))
				.serializeValuesWith(
						RedisSerializationContext.SerializationPair.fromSerializer(serializer)
				);

		return RedisCacheManager.builder(connectionFactory)
				.cacheDefaults(cacheConfig)
				.build();
	}
}