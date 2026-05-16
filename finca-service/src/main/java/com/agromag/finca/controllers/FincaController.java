package com.agromag.finca.controllers;

import com.agromag.finca.entities.Finca;
import com.agromag.finca.services.FincaService;
import com.agromag.finca.dto.FincaDTO;
import com.agromag.finca.dto.FincaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fincas")
@RequiredArgsConstructor
public class FincaController {

    private final FincaService fincaService;

    @GetMapping
    public ResponseEntity<List<FincaDTO>> getAllFincas() {
        List<FincaDTO> fincas = fincaService.getAllFincas().stream().map(FincaMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(fincas);
    }

    @GetMapping("/active")
    public ResponseEntity<List<FincaDTO>> getActiveFincas() {
        List<FincaDTO> fincas = fincaService.getActiveFincas().stream().map(FincaMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(fincas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FincaDTO> getFincaById(@PathVariable Long id) {
        return fincaService.getFincaById(id)
                .map(finca -> ResponseEntity.ok(FincaMapper.toDTO(finca)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FincaDTO> createFinca(@RequestBody FincaDTO fincaDTO) {
        Finca finca = FincaMapper.toEntity(fincaDTO);
        Finca createdFinca = fincaService.createFinca(finca);
        return ResponseEntity.ok(FincaMapper.toDTO(createdFinca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FincaDTO> updateFinca(@PathVariable Long id, @RequestBody FincaDTO fincaDetailsDTO) {
        Finca fincaDetails = FincaMapper.toEntity(fincaDetailsDTO);
        Finca updatedFinca = fincaService.updateFinca(id, fincaDetails);
        if (updatedFinca != null) {
            return ResponseEntity.ok(FincaMapper.toDTO(updatedFinca));
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
    public ResponseEntity<FincaDTO> toggleActive(@PathVariable Long id) {
        Finca finca = fincaService.toggleActive(id);
        if (finca != null) {
            return ResponseEntity.ok(FincaMapper.toDTO(finca));
        }
        return ResponseEntity.notFound().build();
    }
}