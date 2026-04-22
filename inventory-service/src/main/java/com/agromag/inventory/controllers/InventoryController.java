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
}