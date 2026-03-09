import { RandomForestRegression } from 'ml-random-forest';
import fs from 'fs';
import path from 'path';

/**
 * Machine Learning Module for EcoBazaarX
 * This module handles the ML pipeline: Preprocessing, Training, Evaluation, and Prediction.
 */

export interface MLData {
  weight: number;
  material: string;
  usage_frequency: number;
  transport_distance: number;
  carbon_emission?: number; // Target variable for training
}

export interface MLModelMetadata {
  version: string;
  trainedAt: string;
  accuracy: number;
  featureImportance: number[];
}

class CarbonMLModule {
  private model: RandomForestRegression | null = null;
  private metadata: MLModelMetadata | null = null;
  private modelPath = path.join(process.cwd(), 'carbon_model.json');

  constructor() {
    this.loadModel();
  }

  /**
   * Data Preprocessing
   * Converts raw input into numerical features for the model.
   */
  private preprocess(data: MLData): number[] {
    const materialFactors: Record<string, number> = {
      'plastic': 1,
      'metal': 2,
      'wood': 3,
      'glass': 4,
      'cotton': 5,
      'bamboo': 6,
      'hemp': 7,
      'ceramic': 8
    };

    return [
      data.weight,
      materialFactors[data.material.toLowerCase()] || 0,
      data.usage_frequency,
      data.transport_distance
    ];
  }

  /**
   * Model Training
   * Uses Random Forest Regression to train on the provided dataset.
   */
  public train(trainingSet: MLData[]) {
    console.log('ML Module: Starting model training with Random Forest...');
    
    const X = trainingSet.map(d => this.preprocess(d));
    const y = trainingSet.map(d => d.carbon_emission || 0);

    const options = {
      seed: 42,
      maxFeatures: 0.8,
      replacement: true,
      nEstimators: 50
    };

    this.model = new RandomForestRegression(options);
    this.model.train(X, y);

    // Simple evaluation on the training set (for demo purposes)
    const predictions = this.model.predict(X);
    let error = 0;
    for (let i = 0; i < y.length; i++) {
      error += Math.abs(y[i] - predictions[i]);
    }
    const avgError = error / y.length;
    const accuracy = 1 - (avgError / (Math.max(...y) || 1));

    this.metadata = {
      version: '2.0.0',
      trainedAt: new Date().toISOString(),
      accuracy: parseFloat(accuracy.toFixed(4)),
      featureImportance: [] // ml-random-forest doesn't easily expose feature importance in this version
    };

    console.log(`ML Module: Training complete. Accuracy: ${this.metadata.accuracy}`);
    this.serializeModel();
  }

  /**
   * Model Serialization
   * Saves the model state to a JSON file.
   */
  private serializeModel() {
    if (!this.model || !this.metadata) return;
    
    const modelData = {
      model: this.model.toJSON(),
      metadata: this.metadata
    };

    fs.writeFileSync(this.modelPath, JSON.stringify(modelData));
    console.log('ML Module: Model serialized and saved to disk.');
  }

  /**
   * Load Model
   */
  private loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const rawData = fs.readFileSync(this.modelPath, 'utf8');
        const { model, metadata } = JSON.parse(rawData);
        this.model = RandomForestRegression.load(model);
        this.metadata = metadata;
        console.log('ML Module: Pre-trained model loaded from disk.');
      } else {
        console.log('ML Module: No pre-trained model found. Please train the model.');
      }
    } catch (err) {
      console.error('ML Module: Error loading model:', err);
    }
  }

  /**
   * Prediction API
   * Uses the trained model to predict carbon emissions.
   */
  public predict(data: MLData) {
    if (!this.model) {
      // Fallback if model not trained
      return {
        prediction: (data.weight * 1.5) + (data.transport_distance * 0.05),
        confidence: 0.5,
        model_version: 'fallback-v1'
      };
    }

    const features = this.preprocess(data);
    const prediction = this.model.predict([features])[0];

    // Emission Classification
    let classification = 'Medium';
    if (prediction < 5) classification = 'Low';
    else if (prediction > 15) classification = 'High';

    return {
      prediction: parseFloat(prediction.toFixed(2)),
      classification,
      confidence: this.metadata?.accuracy || 0.9,
      model_version: this.metadata?.version || '2.0.0'
    };
  }

  /**
   * Model Evaluation
   */
  public evaluate() {
    return {
      accuracy: this.metadata?.accuracy || 0,
      last_trained: this.metadata?.trainedAt || 'Never',
      status: this.model ? 'Ready' : 'Not Trained'
    };
  }
}

export const mlModule = new CarbonMLModule();
