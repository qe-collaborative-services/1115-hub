# Universal CSV Assurance Strategy

QE Collaborative Services (`QCS`) uses The National Archives' [CSV Schema](https://github.com/digital-preservation/csv-schema) and [csv-validator](https://github.com/digital-preservation/csv-validator) to validate CSV files.

- [Learn more about CSV Schema versions and tooling](https://digital-preservation.github.io/csv-schema/)
- [See example CSV Schema files and CSV files](https://github.com/digital-preservation/csv-schema/tree/master/example-schemas)

## Building the source locally

Assuming you have a JDK and `mvn` (Apache Maven) installed, you can run the following:

```bash
mvn package
```

If you do not have a JDK or Maven installed, see _Install Java and Maven on WSL or Linux_ below.

## Usage

To see a "happy" path (when a CSV file passes schema assurance/validation):

```bash
$ java -jar ./target/CsvAssurance-0.1.0-jar-with-dependencies.jar ./text-fixture/example-concat-pass1.csv ./csv-schema/example-concat.csvs
Completed validation OK
```

To see the "unhappy" (failure) paths (when CSV file does not match schema assurance/validation rules):

```bash
java -jar ./target/CsvAssurance-0.1.0-jar-with-dependencies.jar ./text-fixture/example-concat-fail1.csv ./csv-schema/example-concat.csvs
[ERROR] is(concat($c1, $c2)) fails for line: 2, column: c3, value: "the tree is"
```

## Install Java and Maven on WSL or Linux

Use `asdf` if you're not sure how to setup your own Java environment.

```bash
$ asdf plugin-add java
$ asdf install java openjdk-21
$ asdf global java openjdk-21
$ java --version

$ asdf plugin-add maven
$ asdf install maven latest
$ asdf global maven latest
$ mvn --version
```