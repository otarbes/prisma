import {GraphcoolConfig, Resolver, ProjectInfo} from '../types'
import {graphcoolConfigFilePath, graphcoolProjectFileName, projectFileSuffixes} from './constants'
import * as path from 'path'
const debug = require('debug')('graphcool')
import * as fs from 'fs'

/*
 * Graphcool Config (/project.graphcool)
 */

export function writeProjectFile(projectInfo: ProjectInfo, resolver: Resolver) {
  const schemaWithHeader = `# @project ${projectInfo.projectId}\n# @version ${projectInfo.version || ''}\n\n${projectInfo.schema}`
  resolver.write(graphcoolProjectFileName, schemaWithHeader)
}

export function readProjectIdFromProjectFile(resolver: Resolver, path?: string): string {
  const pathToProjectFile = getPathToProjectFile(path)
  const contents = resolver.read(pathToProjectFile)

  const matches = contents.match(/# @project ([a-z0-9]*)/)

  if (!matches || matches.length !== 2) {
    throw new Error(`${pathToProjectFile} doesn't contain a project ID.`)
  }

  return matches[1]
}

export function readDataModelFromProjectFile(resolver: Resolver, path?: string): string {
  const pathToProjectFile = path ? `${path}/${graphcoolProjectFileName}` : `./${graphcoolProjectFileName}`
  const contents = resolver.read(pathToProjectFile)

  const dataModelStartIndex = contents.indexOf(`type`)
  const dataModel = contents.substring(dataModelStartIndex, contents.length)
  return dataModel
}

function getPathToProjectFile(filePath?: string): string {
  if (!filePath) {
    return `./${graphcoolProjectFileName}` // default filePath
  }

  // does the path already point to a project file
  const projectFileResult = projectFileSuffixes.filter(suffix => filePath.endsWith(suffix))
  if (projectFileResult.length > 0) {
    return filePath
  }

  // the path only points to a directory
  return path.join(filePath, graphcoolProjectFileName)
}

function findProjectFile(): string | undefined {
  const schemaFiles = fs.readdirSync('.').filter(f => f.endsWith('.schema'))
  const file = schemaFiles.find(f => f === graphcoolProjectFileName) || schemaFiles[0]
  return file
}


/*
 * Graphcool Config (~/.graphcool)
 */

export function readGraphcoolConfig(resolver: Resolver): GraphcoolConfig {
  const configFileContent = resolver.read(graphcoolConfigFilePath)
  return JSON.parse(configFileContent)
}

export function writeGraphcoolConfig(config: GraphcoolConfig, resolver: Resolver): void {
  resolver.write(graphcoolConfigFilePath, JSON.stringify(config, null, 2))
}

export function deleteGraphcoolConfig(resolver: Resolver): void {
  resolver.delete(graphcoolConfigFilePath)
}
