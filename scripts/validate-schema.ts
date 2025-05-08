#!/usr/bin/env ts-node
/**
 * Supabase Schema Validation Script
 * 
 * This script validates that the Supabase database schema
 * matches what our application expects.
 * 
 * Run with: npx ts-node scripts/validate-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '../lib/supabase-types'
import chalk from 'chalk'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const REQUIRED_TABLES = [
  'tasks',
  'steps',
  'user_settings',
]

const REQUIRED_FIELDS = {
  tasks: [
    'id',
    'name',
    'status',
    'timestamp',
    'preview',
    'security_level',
    'user_id',
  ],
  steps: [
    'id',
    'task_id',
    'name',
    'action_type',
    'status',
    'log',
  ],
  user_settings: [
    'id',
    'user_id',
    'theme',
    'security_level',
    'notifications_enabled',
    'default_mode',
  ],
}

// RLS policies that should be in place
const REQUIRED_RLS_POLICIES = {
  tasks: [
    'Users can only view their own tasks',
    'Users can only insert their own tasks',
    'Users can only update their own tasks',
    'Users can only delete their own tasks',
  ],
  steps: [
    'Users can only view steps for their tasks',
    'Users can only insert steps for their tasks',
    'Users can only update steps for their tasks',
  ],
  user_settings: [
    'Users can only view their own settings',
    'Users can only update their own settings',
  ],
}

async function validateSchema() {
  console.log(chalk.blue('🔍 Validating Supabase Schema...'))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(chalk.red('❌ Missing Supabase environment variables'))
    process.exit(1)
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // 1. Check if tables exist
    console.log(chalk.cyan('Checking required tables...'))
    for (const tableName of REQUIRED_TABLES) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.error(chalk.red(`❌ Table '${tableName}' error: ${error.message}`))
        continue
      }

      console.log(chalk.green(`✅ Table '${tableName}' exists`))
    }

    // 2. Check table structures (optional)
    console.log(chalk.cyan('\nChecking table fields...'))
    for (const tableName of REQUIRED_TABLES) {
      const { data: columns, error } = await supabase
        .rpc('get_table_columns', { table_name: tableName })

      if (error) {
        console.error(chalk.red(`❌ Cannot fetch columns for '${tableName}': ${error.message}`))
        continue
      }

      const columnNames = columns.map((col: any) => col.column_name)
      const missingColumns = REQUIRED_FIELDS[tableName as keyof typeof REQUIRED_FIELDS].filter(
        col => !columnNames.includes(col)
      )

      if (missingColumns.length > 0) {
        console.error(chalk.red(`❌ Table '${tableName}' is missing columns: ${missingColumns.join(', ')}`))
      } else {
        console.log(chalk.green(`✅ Table '${tableName}' has all required columns`))
      }
    }

    // 3. Check RLS policies (optional if you have access)
    console.log(chalk.cyan('\nChecking RLS policies...'))
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies')

    if (policiesError) {
      console.error(chalk.yellow(`⚠️ Cannot check RLS policies: ${policiesError.message}`))
    } else {
      for (const tableName of REQUIRED_TABLES) {
        const tablePolicies = policies.filter((p: any) => p.table === tableName)
        
        if (tablePolicies.length === 0) {
          console.error(chalk.red(`❌ No RLS policies found for '${tableName}'`))
        } else {
          console.log(chalk.green(`✅ Found ${tablePolicies.length} policies for '${tableName}'`))
          
          // Log policy names
          tablePolicies.forEach((policy: any) => {
            console.log(chalk.gray(`   - ${policy.name}`))
          })
        }
      }
    }

    console.log(chalk.blue('\n✅ Schema validation complete!'))
  } catch (error) {
    console.error(chalk.red(`❌ Validation failed: ${error}`))
    process.exit(1)
  }
}

validateSchema() 