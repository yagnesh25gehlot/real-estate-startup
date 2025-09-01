const { PrismaClient } = require('@prisma/client');
const AWS = require('aws-sdk');

const prisma = new PrismaClient();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

async function cleanupOldS3Files() {
  try {
    console.log('🔍 Starting S3 cleanup process...');
    console.log('📦 Bucket:', BUCKET_NAME);
    console.log('🌍 Environment:', process.env.NODE_ENV);

    if (!BUCKET_NAME) {
      console.error('❌ AWS_S3_BUCKET not configured');
      return;
    }

    // List all objects in the bucket
    console.log('📋 Listing all objects in S3 bucket...');
    const objects = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000
    }).promise();

    console.log(`📊 Found ${objects.Contents?.length || 0} objects in bucket`);

    if (!objects.Contents || objects.Contents.length === 0) {
      console.log('✅ No objects found in bucket');
      return;
    }

    // Filter objects that don't have environment prefixes
    const oldObjects = objects.Contents.filter(obj => {
      const key = obj.Key;
      return !key.startsWith('dev/') && !key.startsWith('prod/');
    });

    console.log(`🗑️ Found ${oldObjects.length} objects without environment prefixes`);

    if (oldObjects.length === 0) {
      console.log('✅ All objects already have environment prefixes');
      return;
    }

    // Show what will be deleted
    console.log('\n📋 Objects to be cleaned up:');
    oldObjects.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
    });

    // Actually delete the old files
    console.log('\n🗑️ Deleting old files...');
    const deletePromises = oldObjects.map(obj => 
      s3.deleteObject({
        Bucket: BUCKET_NAME,
        Key: obj.Key
      }).promise()
    );

    await Promise.all(deletePromises);
    console.log(`✅ Successfully deleted ${oldObjects.length} old files`);

  } catch (error) {
    console.error('❌ Error during S3 cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Also check database for orphaned files
async function checkDatabaseForOrphanedFiles() {
  try {
    console.log('\n🔍 Checking database for orphaned file references...');

    // Get all properties
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        mediaUrls: true,
        registryImage: true,
        otherDocuments: true,
        electricityBillImage: true,
        waterBillImage: true
      }
    });

    console.log(`📊 Found ${properties.length} properties in database`);

    let totalOrphanedFiles = 0;

    properties.forEach(property => {
      const files = [];
      
      // Check media URLs
      if (property.mediaUrls) {
        try {
          const mediaUrls = JSON.parse(property.mediaUrls);
          files.push(...mediaUrls);
        } catch (e) {
          console.log(`⚠️  Error parsing mediaUrls for property ${property.id}:`, e.message);
        }
      }

      // Check registry image
      if (property.registryImage) {
        try {
          const registryUrls = JSON.parse(property.registryImage);
          if (Array.isArray(registryUrls)) {
            files.push(...registryUrls);
          } else {
            files.push(property.registryImage);
          }
        } catch (e) {
          files.push(property.registryImage);
        }
      }

      // Check other documents
      if (property.otherDocuments) {
        try {
          const otherUrls = JSON.parse(property.otherDocuments);
          if (Array.isArray(otherUrls)) {
            files.push(...otherUrls);
          } else {
            files.push(property.otherDocuments);
          }
        } catch (e) {
          files.push(property.otherDocuments);
        }
      }

      // Check individual document fields
      if (property.electricityBillImage) files.push(property.electricityBillImage);
      if (property.waterBillImage) files.push(property.waterBillImage);

      // Check for files without environment prefixes
      const orphanedFiles = files.filter(url => {
        if (url.includes('amazonaws.com')) {
          const key = url.split('.com/')[1];
          return key && !key.startsWith('dev/') && !key.startsWith('prod/');
        }
        return false;
      });

      if (orphanedFiles.length > 0) {
        console.log(`⚠️  Property "${property.title}" (${property.id}) has ${orphanedFiles.length} files without environment prefixes:`);
        orphanedFiles.forEach(file => console.log(`   - ${file}`));
        totalOrphanedFiles += orphanedFiles.length;
      }
    });

    console.log(`\n📊 Total orphaned files in database: ${totalOrphanedFiles}`);

  } catch (error) {
    console.error('❌ Error checking database for orphaned files:', error);
  }
}

// Run both checks
async function main() {
  await cleanupOldS3Files();
  await checkDatabaseForOrphanedFiles();
}

main();
