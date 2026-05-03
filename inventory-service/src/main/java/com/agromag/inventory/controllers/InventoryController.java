package com.agromag.inventory.controllers;

import com.agromag.inventory.entities.Insumo;
import com.agromag.inventory.entities.Aplicacion;
import com.agromag.inventory.repositories.InsumoRepository;
import com.agromag.inventory.services.InsumoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bodega")
public class InventoryController {

    @Autowired
    private InsumoRepository insumoRepository;

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
