package com.agromag.finca.controllers;

import com.agromag.finca.entities.Novedad;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.agromag.finca.services.NovedadService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/novedades")
public class NovedadController {

    @Autowired
    private NovedadService novedadService;

    @PostMapping
    public ResponseEntity<?> registrar(@RequestBody Novedad novedad) {
        try {
            novedad.setFecha(LocalDateTime.now());
            return ResponseEntity.ok(novedadService.guardar(novedad));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar la novedad: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            return ResponseEntity.ok(novedadService.listarPorLote(null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al listar novedades: " + e.getMessage());
        }
    }

    @GetMapping("/lote/{loteId}")
    public ResponseEntity<?> listarPorLote(@PathVariable Long loteId) {
        try {
            return ResponseEntity.ok(novedadService.listarPorLote(loteId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al listar novedades del lote: " + e.getMessage());
        }
    }
}