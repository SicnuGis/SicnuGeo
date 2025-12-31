package com.sicnu.geo.service;

import com.sicnu.geo.entity.User;

public interface UserService {
    void sendCode(String phone);
    User login(String phone, String code);
}
