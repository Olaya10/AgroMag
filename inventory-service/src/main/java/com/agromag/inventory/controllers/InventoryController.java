package com.agromag.inventory.controllers;

import com.agromag.inventory.entities.Insumo;
import com.agromag.inventory.entities.Aplicacion;
import com.agromag.inventory.repositories.InsumoRepository;
import com.agromag.inventory.repositories.AplicacionRepository;
import com.agromag.inventory.services.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bodega")
public class InventoryController {

    @Autowired
    private InsumoRepository insumoRepository;

    @Autowired
    private AplicacionRepository aplicacionRepository;

    @Autowired
    private InsumoService insumoService;

    @PostMapping("/insumos")
    public Insumo crearInsumo(@RequestBody Insumo insumo) {
        return insumoRepository.save(insumo);
    }

    @GetMapping("/insumos")
    public List<Insumo> listarInsumos() {
        return insumoRepository.findAll();
    }

    @PostMapping("/aplicar")
    public Aplicacion registrarAplicacion(@RequestBody Aplicacion aplicacion) {
        return insumoService.registrarAplicacion(aplicacion);
    }

    @GetMapping("/aplicaciones")
    public List<Aplicacion> listarAplicaciones() {
        return insumoService.listarAplicaciones();
    }

    @PutMapping("/aplicaciones/{id}")
    public ResponseEntity<?> actualizarAplicacion(@PathVariable Long id, @RequestBody Aplicacion aplicacionDetalles) {
        try {
            Aplicacion existing = aplicacionRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Aplicación no encontrada"));

            existing.setLoteId(aplicacionDetalles.getLoteId());
            existing.setOperarioId(aplicacionDetalles.getOperarioId());
            existing.setDosis(aplicacionDetalles.getDosis());
            existing.setFecha(aplicacionDetalles.getFecha());
            if (aplicacionDetalles.getInsumo() != null) {
                existing.setInsumo(aplicacionDetalles.getInsumo());
            }

            return ResponseEntity.ok(aplicacionRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la aplicación: " + e.getMessage());
        }
    }

    @DeleteMapping("/aplicaciones/{id}")
    public ResponseEntity<?> eliminarAplicacion(@PathVariable Long id) {
        try {
            aplicacionRepository.deleteById(id);
            return ResponseEntity.ok("Aplicación eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la aplicación: " + e.getMessage());
        }
    }

    @PutMapping("/insumos/{id}")
    public Insumo actualizarInsumo(@PathVariable Long id, @RequestBody Insumo insumo) {
        return insumoRepository.findById(id)
                .map(existing -> {
                    existing.setNombreComercial(insumo.getNombreComercial());
                    existing.setTipo(insumo.getTipo());
                    existing.setStockActual(insumo.getStockActual());
                    existing.setUmbralCritico(insumo.getUmbralCritico());
                    existing.setUnidadMedida(insumo.getUnidadMedida());
                    return insumoRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
    }

    @DeleteMapping("/insumos/{id}")
    public void eliminarInsumo(@PathVariable Long id) {
        insumoRepository.deleteById(id);
    }
}
