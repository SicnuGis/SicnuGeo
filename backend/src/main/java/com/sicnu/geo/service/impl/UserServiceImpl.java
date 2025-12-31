package com.sicnu.geo.service.impl;

import com.sicnu.geo.entity.User;
import com.sicnu.geo.repository.UserRepository;
import com.sicnu.geo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private UserRepository userRepository;

    private static final String LOGIN_CODE_KEY = "login:code:";
    private static final Long LOGIN_CODE_TTL = 5L; // 5 minutes

    @Override
    public void sendCode(String phone) {
        // 1. Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(999999));

        // 2. Save to Redis with TTL
        stringRedisTemplate.opsForValue().set(LOGIN_CODE_KEY + phone, code, LOGIN_CODE_TTL, TimeUnit.MINUTES);

        // 3. Send SMS (Mock implementation)
        System.out.println("Sending SMS to " + phone + ": " + code);
    }

    @Override
    public User login(String phone, String code) {
        // 1. Verify code from Redis
        String cacheCode = stringRedisTemplate.opsForValue().get(LOGIN_CODE_KEY + phone);
        if (cacheCode == null || !cacheCode.equals(code)) {
            throw new RuntimeException("验证码错误或已过期");
        }

        // 2. Find user or register
        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User newUser = new User();
            newUser.setPhone(phone);
            newUser.setNickName("User_" + phone.substring(phone.length() - 4));
            newUser.setRole("normal"); // Default role
            return userRepository.save(newUser);
        });

        // 3. Delete code from Redis
        stringRedisTemplate.delete(LOGIN_CODE_KEY + phone);

        return user;
    }
}
