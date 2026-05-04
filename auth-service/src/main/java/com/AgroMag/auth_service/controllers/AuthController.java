package com.AgroMag.auth_service.controllers;

import com.AgroMag.auth_service.dto.AuthenticationResponse;
import com.AgroMag.auth_service.dto.UserDTO;
import com.AgroMag.auth_service.entities.User;
import com.AgroMag.auth_service.security.JwtService;
import com.AgroMag.auth_service.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody User user) {
        try {
            UserDTO newUser = userService.register(user);
            return ResponseEntity.ok(newUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginData) {
        try {
            User user = userService.login(loginData.getEmail(), loginData.getPassword());
            UserDTO userDTO = new UserDTO(
                    user.getId(),
                    user.getName(),
                    user.getCedula(),
                    user.getEdad(),
                    user.getEmail(),
                    user.getRole(),
                    user.getActive());
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthenticationResponse(token, userDTO));
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
            UserDTO updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar: " + e.getMessage());
        }
    }

    @PatchMapping("/users/{id}/active")
    public ResponseEntity<?> setActive(@PathVariable Long id, @RequestBody Boolean active) {
        try {
            UserDTO updatedUser = userService.setActive(id, active);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar estado: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("Usuario eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<UserDTO>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(userService.buscarUsuarios(q));
    }
}