#!/usr/bin/env tsx
/**
 * Complete Migration Orchestrator
 * 
 * This script orchestrates the complete chapter admin system migration:
 * 1. Creates pre-migration snapshot
 * 2. Runs school data migration
 * 3. Runs asset migration
 * 4. Validates results
 * 5. Generates report
 * 6. Provides rollback option if needed
 */

import { SchoolDataMigrator } from './migrate-school-data-to-asset-manager'
import { AssetMigrationUtilities } from './migrate-assets-to-asset-manager'
import { MigrationValidator } from './migration-validation-and-rollback'

interface MigrationOptions {
  skipSnapshot?: boolean
  skipSchoolMigration?: boolean
  skipAssetMigration?: boolean
  skipValidation?: boolean
  autoRollbackOnFailure?: boolean
}

class CompleteMigrationOrchestrator {
  private validator = new MigrationValidator()
  private snapshotFile?: string

  async runCompleteMigration(options: MigrationOptions = {}): Promise<void> {
    console.log('🚀 Starting complete chapter admin system migration...')
    console.log('=' .repeat(60))

    try {
      // Step 1: Create snapshot
      if (!options.skipSnapshot) {
        console.log('\n📸 Step 1: Creating pre-migration snapshot...')
        this.snapshotFile = await this.validator.createPreMigrationSnapshot()
        console.log('✅ Snapshot created successfully')
      } else {
        console.log('\n⏭️  Step 1: Skipping snapshot creation')
      }

      // Step 2: School data migration
      if (!options.skipSchoolMigration) {
        console.log('\n🏫 Step 2: Migrating school data...')
        const schoolMigrator = new SchoolDataMigrator()
        const schoolStats = await schoolMigrator.migrate()
        
        if (schoolStats.errors.length > 0) {
          console.log('⚠️  School migration completed with errors')
          if (options.autoRollbackOnFailure && this.snapshotFile) {
            await this.performRollback()
            return
          }
        } else {
          console.log('✅ School migration completed successfully')
        }
      } else {
        console.log('\n⏭️  Step 2: Skipping school data migration')
      }

      // Step 3: Asset migration
      if (!options.skipAssetMigration) {
        console.log('\n🖼️  Step 3: Migrating assets...')
        const assetMigrator = new AssetMigrationUtilities()
        const assetStats = await assetMigrator.migrate()
        
        if (assetStats.errors.length > 0) {
          console.log('⚠️  Asset migration completed with errors')
          if (options.autoRollbackOnFailure && this.snapshotFile) {
            await this.performRollback()
            return
          }
        } else {
          console.log('✅ Asset migration completed successfully')
        }
      } else {
        console.log('\n⏭️  Step 3: Skipping asset migration')
      }

      // Step 4: Validation
      if (!options.skipValidation) {
        console.log('\n🔍 Step 4: Validating migration results...')
        const validation = await this.validator.validateMigration()
        
        if (!validation.isValid) {
          console.log('❌ Migration validation failed')
          if (options.autoRollbackOnFailure && this.snapshotFile) {
            await this.performRollback()
            return
          }
        } else {
          console.log('✅ Migration validation passed')
        }
      } else {
        console.log('\n⏭️  Step 4: Skipping validation')
      }

      // Step 5: Generate report
      console.log('\n📊 Step 5: Generating migration report...')
      const reportFile = await this.validator.generateMigrationReport()
      console.log(`✅ Report generated: ${reportFile}`)

      // Success message
      console.log('\n' + '=' .repeat(60))
      console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!')
      console.log('=' .repeat(60))
      
      console.log('\n📋 Next Steps:')
      console.log('1. ✅ Review the migration report for any warnings')
      console.log('2. ✅ Test the application to ensure everything works correctly')
      console.log('3. ✅ Update frontend components to use new asset API endpoints')
      console.log('4. ✅ Remove legacy imageUrl fields once everything is working')
      console.log('5. ✅ Clean up orphaned files if any were identified')

      if (this.snapshotFile) {
        console.log(`\n💾 Snapshot available for rollback: ${this.snapshotFile}`)
        console.log('   Use: tsx migration-validation-and-rollback.ts rollback <snapshot-file>')
      }

    } catch (error) {
      console.error('\n💥 Migration failed:', error)
      
      if (options.autoRollbackOnFailure && this.snapshotFile) {
        await this.performRollback()
      } else {
        console.log('\n🔄 To rollback manually, run:')
        console.log(`   tsx migration-validation-and-rollback.ts rollback ${this.snapshotFile}`)
      }
      
      throw error
    }
  }

  private async performRollback(): Promise<void> {
    if (!this.snapshotFile) {
      console.log('❌ No snapshot available for rollback')
      return
    }

    console.log('\n🔄 Performing automatic rollback...')
    try {
      await this.validator.rollbackMigration(this.snapshotFile)
      console.log('✅ Rollback completed successfully')
    } catch (rollbackError) {
      console.error('💥 Rollback failed:', rollbackError)
      console.log(`\n🔄 Manual rollback required using: ${this.snapshotFile}`)
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2)
  const options: MigrationOptions = {}

  // Parse command line arguments
  for (const arg of args) {
    switch (arg) {
      case '--skip-snapshot':
        options.skipSnapshot = true
        break
      case '--skip-school-migration':
        options.skipSchoolMigration = true
        break
      case '--skip-asset-migration':
        options.skipAssetMigration = true
        break
      case '--skip-validation':
        options.skipValidation = true
        break
      case '--auto-rollback':
        options.autoRollbackOnFailure = true
        break
      case '--help':
        console.log(`
Chapter Admin System Migration Orchestrator

Usage: tsx run-complete-migration.ts [options]

Options:
  --skip-snapshot           Skip creating pre-migration snapshot
  --skip-school-migration   Skip school data migration
  --skip-asset-migration    Skip asset migration
  --skip-validation         Skip migration validation
  --auto-rollback           Automatically rollback on failure
  --help                    Show this help message

Examples:
  tsx run-complete-migration.ts                    # Full migration
  tsx run-complete-migration.ts --auto-rollback    # With auto-rollback
  tsx run-complete-migration.ts --skip-snapshot    # Skip snapshot creation
`)
        process.exit(0)
        break
    }
  }

  const orchestrator = new CompleteMigrationOrchestrator()
  
  try {
    await orchestrator.runCompleteMigration(options)
    process.exit(0)
  } catch (error) {
    console.error('💥 Migration orchestration failed:', error)
    process.exit(1)
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error in migration orchestrator:', error)
    process.exit(1)
  })
}

export { CompleteMigrationOrchestrator }