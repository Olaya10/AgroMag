package com.AgroMag.auth_service.repositories;

import com.AgroMag.auth_service.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Para el RF03: Validar que el correo no exista
}