package com.agromag.finca.controllers;

import com.agromag.finca.entities.Cultivo;
import com.agromag.finca.services.CultivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cultivos")
@RequiredArgsConstructor
public class CultivoController {

    private final CultivoService cultivoService;

    @GetMapping
    public List<Cultivo> listarActivos() {
        return cultivoService.listarActivos();
    }

    @GetMapping("/todos")
    public List<Cultivo> listarTodos() {
        return cultivoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cultivoService.obtenerPorId(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Cultivo cultivo) {
        try {
            return ResponseEntity.ok(cultivoService.guardar(cultivo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Cultivo cultivo) {
        try {
            cultivo.setId(id);
            return ResponseEntity.ok(cultivoService.actualizar(id, cultivo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            cultivoService.eliminar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        try {
            cultivoService.desactivar(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        try {
            Cultivo cultivo = cultivoService.toggleActive(id);
            if (cultivo != null) {
                return ResponseEntity.ok(cultivo);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
