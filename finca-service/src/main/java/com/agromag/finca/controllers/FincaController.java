package com.agromag.finca.controllers;

import com.agromag.finca.entities.Finca;
import com.agromag.finca.services.FincaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fincas")
public class FincaController {

    @Autowired
    private FincaService fincaService;

    @GetMapping
    public ResponseEntity<List<Finca>> getAllFincas() {
        List<Finca> fincas = fincaService.getAllFincas();
        return ResponseEntity.ok(fincas);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Finca>> getActiveFincas() {
        List<Finca> fincas = fincaService.getActiveFincas();
        return ResponseEntity.ok(fincas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Finca> getFincaById(@PathVariable Long id) {
        return fincaService.getFincaById(id)
                .map(finca -> ResponseEntity.ok(finca))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Finca> createFinca(@RequestBody Finca finca) {
        Finca createdFinca = fincaService.createFinca(finca);
        return ResponseEntity.ok(createdFinca);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Finca> updateFinca(@PathVariable Long id, @RequestBody Finca fincaDetails) {
        Finca updatedFinca = fincaService.updateFinca(id, fincaDetails);
        if (updatedFinca != null) {
            return ResponseEntity.ok(updatedFinca);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinca(@PathVariable Long id) {
        if (fincaService.deleteFinca(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Finca> toggleActive(@PathVariable Long id) {
        Finca finca = fincaService.toggleActive(id);
        if (finca != null) {
            return ResponseEntity.ok(finca);
        }
        return ResponseEntity.notFound().build();
    }
}