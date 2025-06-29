#!/usr/bin/env node

/**
 * Script de verificación para deployment
 * Verifica que todos los archivos necesarios estén presentes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando archivos para deployment...\n');

// Archivos requeridos
const requiredFiles = [
    'index.html',
    'styles.css', 
    'script.js',
    'favicon.ico',
    'favicon.svg',
    'manifest.json',
    'netlify.toml',
    '_redirects',
    'README.md'
];

// Archivos opcionales pero recomendados
const optionalFiles = [
    'og-image.png',
    'DEPLOYMENT.md',
    '.gitignore'
];

let allGood = true;

// Verificar archivos requeridos
console.log('📋 Archivos requeridos:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - FALTANTE`);
        allGood = false;
    }
});

console.log('\n📋 Archivos opcionales:');
optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`⚠️  ${file} - Recomendado`);
    }
});

// Verificar contenido de archivos críticos
console.log('\n🔍 Verificando contenido...');

// Verificar index.html
if (fs.existsSync('index.html')) {
    const html = fs.readFileSync('index.html', 'utf8');
    
    if (html.includes('<title>')) {
        console.log('✅ index.html tiene título');
    } else {
        console.log('❌ index.html sin título');
        allGood = false;
    }
    
    if (html.includes('meta name="description"')) {
        console.log('✅ index.html tiene meta description');
    } else {
        console.log('⚠️  index.html sin meta description');
    }
    
    if (html.includes('og:title')) {
        console.log('✅ index.html tiene Open Graph tags');
    } else {
        console.log('⚠️  index.html sin Open Graph tags');
    }
}

// Verificar netlify.toml
if (fs.existsSync('netlify.toml')) {
    const toml = fs.readFileSync('netlify.toml', 'utf8');
    
    if (toml.includes('[build]')) {
        console.log('✅ netlify.toml configurado correctamente');
    } else {
        console.log('❌ netlify.toml mal configurado');
        allGood = false;
    }
}

// Verificar manifest.json
if (fs.existsSync('manifest.json')) {
    try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        if (manifest.name && manifest.short_name) {
            console.log('✅ manifest.json válido');
        } else {
            console.log('❌ manifest.json incompleto');
            allGood = false;
        }
    } catch (e) {
        console.log('❌ manifest.json inválido');
        allGood = false;
    }
}

// Verificar tamaños de archivos
console.log('\n📊 Tamaños de archivos:');
requiredFiles.concat(optionalFiles).forEach(file => {
    if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`📄 ${file}: ${size} KB`);
        
        // Advertir sobre archivos muy grandes
        if (stats.size > 1024 * 1024) { // > 1MB
            console.log(`⚠️  ${file} es muy grande (${size} KB)`);
        }
    }
});

// Resultado final
console.log('\n' + '='.repeat(50));
if (allGood) {
    console.log('🎉 ¡Todo listo para deployment!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Sube los archivos a GitHub');
    console.log('2. Conecta el repo con Netlify');
    console.log('3. ¡Disfruta tu sitio online!');
    console.log('\n🔗 Guía completa: DEPLOYMENT.md');
} else {
    console.log('❌ Hay problemas que resolver antes del deployment');
    console.log('\n🔧 Revisa los archivos marcados con ❌');
}
console.log('='.repeat(50));

process.exit(allGood ? 0 : 1);
