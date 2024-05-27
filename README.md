# Multiple Choice Generator

## Introduction

This project aims to develop a web application prototype that allows users to play previously saved multiple-choice questions, with the choices generated in a different order each time they play. The project also focuses on incorporating standard engineering practices such as **automated testing**, **continuous integration**, **continuous deployment**, and maintaining descriptive changes through **small pull requests** and **focused commits**.

## Feature Summaries

1. **Question Bank Stored in Browser Local Storage**

2. **Score Calculation**

3. **Randomized Order of Choices**: Each time a user plays, they will experience a different order of choices for each question. This concept was initially inspired by an idea from a friend, and I have made modifications to create my own version of it.

## Technical Structure

The project currently utilizes **Next.js** for web application development and leverages **Vercel** for continuous deployment. The codebase is a work in progress, and **ongoing refactoring** will be carried out to improve readability and maintainability.

### Explanation for `createNull` convention

In this project, some classes have creation methods like `Xyz.create` and `Xyz.createNull` respectively. It is a pattern learnt from [Testing Without Mocks: A Pattern Language](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks) by James Shore.

`Xyz.create` is the creation method for production code. `Xyz.createNull` is the creation method for testing side that support parameterless instantiation and provided some fake implementation for some external dependencies to enhance testability and maintainability of unit test test cases. See [Nullable Pattern](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks#nullables) for more details.
