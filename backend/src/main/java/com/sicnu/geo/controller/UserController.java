package com.sicnu.geo.controller;

import com.sicnu.geo.entity.User;
import com.sicnu.geo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/code")
    public String sendCode(@RequestParam String phone) {
        userService.sendCode(phone);
        return "验证码已发送";
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> loginForm, HttpSession session) {
        String phone = loginForm.get("phone");
        String code = loginForm.get("code");
        User user = userService.login(phone, code);
        
        // Store user in session
        session.setAttribute("user", user);
        
        return user;
    }
    
    @PostMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "退出成功";
    }
    
    @GetMapping("/me")
    public User me(HttpSession session) {
        return (User) session.getAttribute("user");
    }
}
