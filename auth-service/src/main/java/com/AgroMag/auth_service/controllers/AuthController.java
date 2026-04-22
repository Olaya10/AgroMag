package com.AgroMag.auth_service.controllers;

import com.AgroMag.auth_service.dto.UserDTO;
import com.AgroMag.auth_service.entities.User;
import com.AgroMag.auth_service.services.UserService;
import com.AgroMag.auth_service.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody User user) {
        try {
            // Llamamos al método correcto del Service
            UserDTO newUser = userService.register(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            // Devolvemos el mensaje de error (como "Email ya existe")
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        try {
            User user = userService.login(loginData.getEmail(), loginData.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/usuarios-json")
    public ResponseEntity<List<UserDTO>> listarUsuarios() {
        List<UserDTO> usuarios = userService.listarTodos(); // Llamamos al servicio
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/update-user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            // Actualizamos todos los campos
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setRole(userDetails.getRole().toUpperCase());

            // Solo actualizamos la contraseña si el usuario envió una nueva
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(userDetails.getPassword());
            }

            userRepository.save(user);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.badRequest().body("El usuario no existe");
            }
            userRepository.deleteById(id);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al eliminar: " + e.getMessage());
        }
    }
}