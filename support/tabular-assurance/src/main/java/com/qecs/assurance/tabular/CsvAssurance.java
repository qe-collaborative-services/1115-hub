package com.qecs.assurance.tabular;

import java.util.ArrayList;
import java.util.List;

import uk.gov.nationalarchives.csv.validator.api.java.FailMessage;
import uk.gov.nationalarchives.csv.validator.api.java.CsvValidator;
import uk.gov.nationalarchives.csv.validator.api.java.Substitution;
import uk.gov.nationalarchives.csv.validator.api.java.WarningMessage;

public class CsvAssurance {

  public static void main(String[] args) {
    Boolean failFast = false;
    List<Substitution> pathSubstitutions = new ArrayList<Substitution>();
    
    if (args.length < 2) {
      System.out.println("[ERROR] Missing required arguments");
      System.out.println("Usage: java -jar CsvAssurance.jar <csvFilename> <csvSchemaFilename>");
      System.out.println("  csvFilename: path to CSV to validate");
      System.out.println("  csvSchemaFilename: path to CSV schema to use");
      return;
    }
    String csvFilename = args[0];
    String csvSchemaFilename = args[1];

    List<FailMessage> messages = CsvValidator.validate(
        csvFilename,
        csvSchemaFilename,
        failFast,
        pathSubstitutions,
        false,
        false);

    if (messages.isEmpty()) {
      System.out.println("Completed validation OK");
    } else {
      for (FailMessage message : messages) {
        if (message instanceof WarningMessage) {
          System.out.println("[WARN] " + message.getMessage());
        } else {
          System.out.println("[ERROR] " + message.getMessage());
        }
      }
    }
  }
}
