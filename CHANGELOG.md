# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.13.4] - 2020-03-20

### Added

- EquipmentManager, TaskManager and EntryManager that manages those entities as a singleton services. This makes the code easier to read avoiding to manage the data in the views.
- This CHANGELOG file

### Changed
- Improve the information displayed in the task history. The time between the previous ack entry and the current entry is now displayed. An exclamation mark shows that the current entry was done after the due date.
- Make the className attribute coherent over all the components with usage with the classnames helper.
- Introduction of lodash

### Removed


[unreleased]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.4...integration
[2.13.4]: https://github.com/PauloDevelo/enginemonitor.reactfront/compare/v2.13.3...v2.13.4