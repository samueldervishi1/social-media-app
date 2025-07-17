package com.chattr.server.services;

import com.chattr.server.models.ModelUpdate;
import com.chattr.server.repositories.ModelUpdateRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ModelUpdateService {

    private final ModelUpdateRepository modelUpdateRepository;

    public ModelUpdateService(ModelUpdateRepository modelUpdateRepository) {
        this.modelUpdateRepository = modelUpdateRepository;
    }

    public ModelUpdate save(ModelUpdate modelUpdate) {
        return modelUpdateRepository.save(modelUpdate);
    }

    public List<ModelUpdate> findAll() {
        return modelUpdateRepository.findAll();
    }

    public Optional<ModelUpdate> findById(String id) {
        return modelUpdateRepository.findById(id);
    }

    public List<ModelUpdate> findByStatus(String status) {
        return modelUpdateRepository.findByStatus(status);
    }

    public List<ModelUpdate> findByVersion(String version) {
        return modelUpdateRepository.findByVersion(version);
    }

    public List<ModelUpdate> findByModelName(String modelName) {
        return modelUpdateRepository.findByModelName(modelName);
    }

    public void deleteById(String id) {
        modelUpdateRepository.deleteById(id);
    }
}
