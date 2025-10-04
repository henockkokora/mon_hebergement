#!/usr/bin/env node

/**
 * Script de vérification de la configuration
 * Vérifie que tous les éléments nécessaires sont en place
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Vérification de la configuration...\n');

let errors = 0;
let warnings = 0;

// Vérifier le fichier .env du backend
const backendEnv = join(__dirname, 'backend', '.env');
if (existsSync(backendEnv)) {
  console.log('✅ Fichier backend/.env trouvé');
} else {
  console.log('❌ Fichier backend/.env manquant');
  console.log('   Créez ce fichier avec les variables nécessaires (voir DEMARRAGE.md)');
  errors++;
}

// Vérifier le dossier uploads du backend
const uploadsDir = join(__dirname, 'backend', 'uploads');
if (existsSync(uploadsDir)) {
  console.log('✅ Dossier backend/uploads/ existe');
} else {
  console.log('⚠️  Dossier backend/uploads/ n\'existe pas (sera créé automatiquement)');
  warnings++;
}

// Vérifier node_modules du backend
const backendNodeModules = join(__dirname, 'backend', 'node_modules');
if (existsSync(backendNodeModules)) {
  console.log('✅ Dépendances backend installées');
} else {
  console.log('❌ Dépendances backend manquantes');
  console.log('   Exécutez: cd backend && npm install');
  errors++;
}

// Vérifier node_modules du frontend
const frontendNodeModules = join(__dirname, 'node_modules');
if (existsSync(frontendNodeModules)) {
  console.log('✅ Dépendances frontend installées');
} else {
  console.log('❌ Dépendances frontend manquantes');
  console.log('   Exécutez: npm install');
  errors++;
}

// Vérifier le fichier imageUtils.js
const imageUtils = join(__dirname, 'app', 'utils', 'imageUtils.js');
if (existsSync(imageUtils)) {
  console.log('✅ Fichier app/utils/imageUtils.js existe');
} else {
  console.log('❌ Fichier app/utils/imageUtils.js manquant');
  errors++;
}

// Résumé
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ Tout est prêt ! Vous pouvez démarrer l\'application.');
  console.log('\n📖 Consultez DEMARRAGE.md pour les instructions de démarrage.');
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} erreur(s) trouvée(s)`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} avertissement(s)`);
  }
  console.log('\n📖 Consultez DEMARRAGE.md pour corriger les problèmes.');
  process.exit(1);
}
