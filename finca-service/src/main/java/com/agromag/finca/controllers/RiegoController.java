package com.agromag.finca.controllers;

import com.agromag.finca.entities.Riego;
import com.agromag.finca.services.RiegoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/riegos")
@RequiredArgsConstructor
public class RiegoController {

    private final RiegoService riegoService;

    @PostMapping
    public ResponseEntity<?> registrarRiego(@RequestBody Riego riego) {
        try {
            return ResponseEntity.ok(riegoService.registrar(riego));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar el riego: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarHistorial() {
        try {
            List<Riego> riegos = riegoService.listarPorLote(null);
            return ResponseEntity.ok(riegos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al listar riegos: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRiego(@PathVariable Long id, @RequestBody Riego riegoDetalles) {
        try {
            Riego riego = riegoService.buscarPorId(id); 
            
            riego.setCantidadAguaLitros(riegoDetalles.getCantidadAguaLitros());
            riego.setFechaHora(riegoDetalles.getFechaHora());
            riego.setObservaciones(riegoDetalles.getObservaciones());
            riego.setLote(riegoDetalles.getLote());
            riego.setCultivo(riegoDetalles.getCultivo());
            
            return ResponseEntity.ok(riegoService.registrar(riego));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar el riego: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRiego(@PathVariable Long id) {
        try {
            riegoService.eliminarRiego(id);
            return ResponseEntity.ok("Riego eliminado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar el riego: " + e.getMessage());
        }
    }

}