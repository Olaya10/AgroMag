package com.AgroMag.auth_service.services;

import com.AgroMag.auth_service.dto.UserDTO;
import com.AgroMag.auth_service.entities.User;
import com.AgroMag.auth_service.repositories.UserRepository;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Instancia del codificador de BCrypt
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // En UserService.java

    public UserDTO register(User user) throws Exception {
        // 1. Validación de email único
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new Exception("El correo electrónico ya está registrado.");
        }

        // 2. Encriptar contraseña
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 3. Guardar en DB
        User savedUser = userRepository.save(user);

        // 4. Convertir a DTO y devolverlo (Sin la contraseña)
        return new UserDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole());
    }

    public User login(String email, String rawPassword) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        if (user.getPassword().equals(rawPassword)) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            return user;
        }

        throw new Exception("Contraseña incorrecta");
    }

    public List<UserDTO> listarTodos() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole()))
                .collect(Collectors.toList());
    }
}