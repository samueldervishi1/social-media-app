package com.chattr.server.controllers;

import com.chattr.server.models.ModelUpdate;
import com.chattr.server.services.ModelUpdateService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/model-updates")
public class ModelUpdateController {

  private final ModelUpdateService modelUpdateService;

  public ModelUpdateController(ModelUpdateService modelUpdateService) {
    this.modelUpdateService = modelUpdateService;
  }

  @PostMapping
  public ResponseEntity<ModelUpdate> create(@RequestBody ModelUpdate modelUpdate) {
    ModelUpdate saved = modelUpdateService.save(modelUpdate);
    return ResponseEntity.ok(saved);
  }

  @GetMapping
  public ResponseEntity<List<ModelUpdate>> getAll() {
    List<ModelUpdate> updates = modelUpdateService.findAll();
    return ResponseEntity.ok(updates);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ModelUpdate> getById(@PathVariable String id) {
    Optional<ModelUpdate> update = modelUpdateService.findById(id);
    return update.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/status/{status}")
  public ResponseEntity<List<ModelUpdate>> getByStatus(@PathVariable String status) {
    List<ModelUpdate> updates = modelUpdateService.findByStatus(status);
    return ResponseEntity.ok(updates);
  }

  @GetMapping("/version/{version}")
  public ResponseEntity<List<ModelUpdate>> getByVersion(@PathVariable String version) {
    List<ModelUpdate> updates = modelUpdateService.findByVersion(version);
    return ResponseEntity.ok(updates);
  }

  @GetMapping("/model/{modelName}")
  public ResponseEntity<List<ModelUpdate>> getByModelName(@PathVariable String modelName) {
    List<ModelUpdate> updates = modelUpdateService.findByModelName(modelName);
    return ResponseEntity.ok(updates);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ModelUpdate> update(
      @PathVariable String id, @RequestBody ModelUpdate modelUpdate) {
    Optional<ModelUpdate> existing = modelUpdateService.findById(id);
    if (existing.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    modelUpdate.setId(id);
    ModelUpdate saved = modelUpdateService.save(modelUpdate);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    modelUpdateService.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
