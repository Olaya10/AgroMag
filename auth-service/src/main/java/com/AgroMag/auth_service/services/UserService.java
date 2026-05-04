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

        // 1b. Normalizar rol y usar un valor por defecto si no se envía
        String role = user.getRole();
        if (role == null || role.isBlank()) {
            role = "OPERARIO";
        }
        user.setRole(role.toUpperCase());

        // 2. Encriptar contraseña
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 2b. Establecer estado activo por defecto
        if (user.getActive() == null) {
            user.setActive(true);
        }

        // 3. Guardar en DB
        User savedUser = userRepository.save(user);

        // 4. Convertir a DTO y devolverlo (Sin la contraseña)
        return new UserDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getCedula(),
                savedUser.getEdad(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getActive());
    }

    public User login(String email, String rawPassword) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new Exception("Contraseña incorrecta");
        }

        if (user.getActive() != null && !user.getActive()) {
            throw new Exception("Cuenta inactiva. Contacta al administrador.");
        }

        return user;
    }

    public List<UserDTO> listarTodos() {
        return userRepository.findAll().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getCedula(),
                        user.getEdad(),
                        user.getEmail(),
                        user.getRole(),
                        user.getActive()))
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(Long id, User userDetails) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole() != null ? userDetails.getRole().toUpperCase() : user.getRole());
        if (userDetails.getActive() != null) {
            user.setActive(userDetails.getActive());
        }

        // Solo actualizamos la contraseña si el usuario envió una nueva
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return new UserDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getCedula(),
                updatedUser.getEdad(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getActive());
    }

    public void deleteUser(Long id) throws Exception {
        if (!userRepository.existsById(id)) {
            throw new Exception("El usuario no existe");
        }
        userRepository.deleteById(id);
    }

    public List<UserDTO> buscarUsuarios(String criterio) {
        return userRepository.buscarUsuarios(criterio)
                .stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getCedula(),
                        user.getEdad(),
                        user.getEmail(),
                        user.getRole(),
                        user.getActive()))
                .collect(Collectors.toList());
    }

    public UserDTO setActive(Long id, Boolean active) throws Exception {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));
        user.setActive(active);
        User updatedUser = userRepository.save(user);
        return new UserDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getCedula(),
                updatedUser.getEdad(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getActive());
    }
}