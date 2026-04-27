package com.agromag.finca.controllers;

import com.agromag.finca.entities.Riego;
import com.agromag.finca.services.RiegoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/riegos")
public class RiegoController {

    @Autowired
    private RiegoService riegoService;

    @PostMapping
    public Riego registrarRiego(@RequestBody Riego riego) {
        return riegoService.registrar(riego);
    }

    @GetMapping
    public List<Riego> listarHistorial() {
        return riegoService.listarPorLote(null);
    }

    @PutMapping("/{id}")
    public Riego actualizarRiego(@PathVariable Long id, @RequestBody Riego riegoDetalles) {
        Riego riego = riegoService.buscarPorId(id); 
        
        riego.setCantidadAguaLitros(riegoDetalles.getCantidadAguaLitros());
        riego.setFechaHora(riegoDetalles.getFechaHora());
        riego.setObservaciones(riegoDetalles.getObservaciones());
        
        return riegoService.registrar(riego);
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