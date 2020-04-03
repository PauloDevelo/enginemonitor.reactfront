# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.13.7] - 2020-04-03

### Changed
-Fix a bug when rebuilding the local storage

## [2.13.6] - 2020-04-03

### Changed
-Add a new colum in the equipment and task history tables to indicates the entry with a picture
-Add some information in the card task details

## [2.13.5] - 2020-03-20

### Changed
-Fix a bug in the task history table when the task is configured only with a time period

## [2.13.4] - 2020-03-20

### Added

- EquipmentManager, TaskManager and EntryManager that manages those entities as a singleton services. This makes the code easier to read avoiding to manage the data in the views.
- This CHANGELOG file

### Changed
- Improve the information displayed in the task history. The time between the previous ack entry and the current entry is now displayed. An exclamation mark shows that the current entry was done after the due date.
- Make the className attribute coherent over all the components with usage with the classnames helper.
- Introduction of lodash

### Removed


[unreleased]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.7...integration
[2.13.7]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.6...v2.13.7
[2.13.6]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.5...v2.13.6
[2.13.5]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.4...v2.13.5
[2.13.4]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.3...v2.13.4