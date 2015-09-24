/**
 * Copyright 2014 Zuercher Hochschule fuer Angewandte Wissenschaften
 * All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * @description Simple PDF Generator library - using maven build framework
 * @author Piyush Harsh
 * @contact: piyush.harsh@zhaw.ch
 * @date 16.12.2014
 */

package ch.icclab.cyclops.dashboard.bills;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.edit.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDJpeg;
import org.apache.pdfbox.pdmodel.graphics.xobject.PDXObjectImage;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.HashMap;

public class BillGenerator {
    final static Logger logger = LogManager.getLogger(BillGenerator.class.getName());

    private static final int ITEM_NAME_OFFSET_X = 50;
    private static final int ITEM_NAME_OFFSET_Y = 40;

    private static final int ITEM_USAGE_OFFSET_X = 150;
    private static final int ITEM_USAGE_OFFSET_Y = 20;

    private static final int ITEM_UNIT_OFFSET_X = 100;
    private static final int ITEM_UNIT_OFFSET_Y = 0;

    private static final int ITEM_RATE_OFFSET_X = 50;
    private static final int ITEM_RATE_OFFSET_Y = 0;

    private static final int ITEM_COST_OFFSET_X = 120;
    private static final int ITEM_COST_OFFSET_Y = 0;

    private static final int TABLE_WIDTH = 580;

    public void createPDF(String path, Bill bill, File logo) throws PdfGenerationException {
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        try {
            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            drawHeader(contentStream);
            drawFooter(document, contentStream, logo);
            drawBillDetail(contentStream, bill.getInfo());
            drawItemizedDetail(contentStream, bill.getUsage(), bill.getRates(), bill.getUnits(), bill.getDiscounts());
            contentStream.close();
            document.save(path);
            document.close();
        } catch (Exception e) {
            logger.error("Error while creating the PDF"+e.getMessage());
            throw new PdfGenerationException(e.getMessage(), e);
        }
    }

    /**
     * drawFooter.
     *
     * @param document      (required) reference to the PDFBox document object
     * @param contentStream (required) reference to the PDPageContentStream object.
     * @param logoFile      (required) full file path of the company's logo file
     */
    private void drawFooter(PDDocument document, PDPageContentStream contentStream, File logoFile) throws IOException {
        //loading the logo image now

        BufferedImage img = null;
        img = ImageIO.read(logoFile);

        if (img != null) {
            PDXObjectImage ximage = new PDJpeg(document, img);
            contentStream.drawImage(ximage, 20, 20);
        }

        contentStream.drawLine(10, 80, 600, 80);
        contentStream.beginText();
        PDFont font = PDType1Font.TIMES_ROMAN;
        contentStream.setFont(font, 10);
        contentStream.moveTextPositionByAmount(75, 65);
        contentStream.drawString("The ICCLab cloud testbeds are provided, maintained as a public service to ZHAW research community. Please respect the model");
        contentStream.moveTextPositionByAmount(0, -10);
        contentStream.drawString("code of conduct, and respect the resource needs of your fellow researchers and students. The consumption figures shown above");
        contentStream.moveTextPositionByAmount(0, -10);
        contentStream.drawString("are just for your information. The cloud services are free at this moment, but this may change without advance notice.");
        contentStream.moveTextPositionByAmount(0, -22);
        contentStream.drawString("(c) 2013-2015 InIT Cloud Computing Lab");
        contentStream.endText();
    }

    /**
     * drawHeader.
     *
     * @param contentStream (required) reference to the PDPageContentStream object.
     */
    private void drawHeader(PDPageContentStream contentStream) throws IOException {
        PDFont font = PDType1Font.HELVETICA_BOLD;
        contentStream.setFont(font, 16);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(140, 750);
        contentStream.drawString("ICCLab - Monthly Resource Usage Summary");
        contentStream.endText();
        contentStream.drawLine(10, 720, 600, 720);
    }

    /**
     * drawBillDetail.
     *
     * @param contentStream (required) reference to the PDPageContentStream object.
     * @param info          (required) dictionary containing the customer details and billing period
     */
    private void drawBillDetail(PDPageContentStream contentStream, HashMap<String, String> info) throws IOException {
        PDFont font = PDType1Font.TIMES_BOLD;

        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(350, 700);
        contentStream.drawString("Customer-Name");
        contentStream.moveTextPositionByAmount(100, 0);
        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.drawString(info.get("person-name"));
        contentStream.endText();

        font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(350, 685);
        contentStream.drawString("Organization");
        contentStream.moveTextPositionByAmount(100, 0);
        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.drawString(info.get("org-name"));
        contentStream.endText();

        font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(350, 670);
        contentStream.drawString("Billing Address");
        contentStream.moveTextPositionByAmount(100, 0);
        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.drawString(info.get("address-line1"));
        contentStream.moveTextPositionByAmount(0, -12);
        contentStream.drawString(info.get("address-line2"));
        contentStream.endText();

        font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(20, 700);
        contentStream.drawString("Billing Period");
        contentStream.moveTextPositionByAmount(80, 0);
        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.drawString(info.get("period-start-date") + "-" + info.get("bill-start-month") + "-" + info.get("bill-start-year") +
                " to " + info.get("period-end-date") + "-" + info.get("bill-end-month") + "-" + info.get("bill-end-year"));
        contentStream.endText();

        font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(20, 685);
        contentStream.drawString("Due Date");
        contentStream.moveTextPositionByAmount(80, 0);
        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.drawString(info.get("payment-date"));
        contentStream.endText();

        font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 14);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(20, 620);
        contentStream.drawString("Itemized Consumption Summary");
        contentStream.endText();

    }

    /**
     * drawItemizedDetail.
     *
     * @param contentStream (required) reference to the PDPageContentStream object.
     * @param usage (required) dictionary containing the various meter usage values
     * @param rate (required) dictionary containing the rates for the corresponding meters in usage dictionary, all meters entry must be present
     * @param unit (required) dictionary containing the unit symbol for the corresponding meters in usage dictionary, all meters entry must be present
     * @param discount (required) dictionary containing the individual volume based discount for the corresponding meters in usage dictionary, all meters entry must be present
     */
    static void drawItemizedDetail(PDPageContentStream contentStream, HashMap<String, Long> usage, HashMap<String, Double> rate, HashMap<String, String> unit, HashMap<String, Double> discount) {
        try {
            final int TABLE_X = 40;
            final int TABLE_Y = 605;
            final int SUMMARY_X = 280;
            final int SUMMARY_OFFSET_Y = 20;

            HashMap<String, Double> itemCost = new HashMap<String, Double>();
            int headerOffset = drawItemizedDetailTableHeader(contentStream, TABLE_X, TABLE_Y);
            int tableOffset = drawItemizedDetailTable(contentStream, TABLE_X, TABLE_Y - headerOffset, usage, rate, unit, itemCost);
            drawItemizedDetailSummary(contentStream, SUMMARY_X, TABLE_Y - tableOffset - SUMMARY_OFFSET_Y - 40, itemCost, discount);
        } catch (IOException ex) {
            System.err.println("Exception caught: " + ex);
            logger.error("Error while drawing details on the bill.");
        }
    }

    private static int drawItemizedDetailTableHeader(PDPageContentStream contentStream, int x, int y) throws IOException {
        final int HEADER_HEIGHT = 20;
        final int FONT_SIZE = 10;

        contentStream.drawLine(x, y, TABLE_WIDTH, y);

        PDType1Font font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, FONT_SIZE);

        contentStream.beginText();
        contentStream.moveTextPositionByAmount(ITEM_NAME_OFFSET_X, y - (HEADER_HEIGHT + FONT_SIZE) / 2);
        contentStream.drawString("Resource Name");

        contentStream.moveTextPositionByAmount(ITEM_USAGE_OFFSET_X, 0);
        contentStream.drawString("Usage Value");

        contentStream.moveTextPositionByAmount(ITEM_UNIT_OFFSET_X, 0);
        contentStream.drawString("Unit");

        contentStream.moveTextPositionByAmount(ITEM_RATE_OFFSET_X, 0);
        contentStream.drawString("Resource Rate");

        contentStream.moveTextPositionByAmount(ITEM_COST_OFFSET_X, 0);
        contentStream.drawString("Usage Cost");
        contentStream.endText();

        contentStream.drawLine(x, y - HEADER_HEIGHT, TABLE_WIDTH, y - HEADER_HEIGHT);
        contentStream.drawLine(x, y, x, y - HEADER_HEIGHT);
        contentStream.drawLine(TABLE_WIDTH, y, TABLE_WIDTH, y - HEADER_HEIGHT);

        return HEADER_HEIGHT;
    }

    private static int drawItemizedDetailTable(PDPageContentStream contentStream, int x, int y, HashMap<String, Long> usage, HashMap<String, Double> rate, HashMap<String, String> unit, HashMap<String, Double> itemCost) throws IOException {
        final int FONT_SIZE = 10;
        final int DELIMITER_PADDING = 8;
        final int INITIAL_FONT_OFFSET = 12;

        int rowIndex = 0;
        int tableHeight = 0;

        for (String key : usage.keySet()) {
            PDType1Font font = PDType1Font.COURIER_BOLD;
            int rowHeight = 0;

            int offsetY = INITIAL_FONT_OFFSET + rowIndex * ITEM_NAME_OFFSET_Y;
            contentStream.setFont(font, FONT_SIZE);
            contentStream.beginText();
            contentStream.moveTextPositionByAmount(ITEM_NAME_OFFSET_X, y - offsetY);
            contentStream.drawString(key);
            rowHeight += offsetY;

            font = PDType1Font.COURIER_OBLIQUE;
            contentStream.setFont(font, FONT_SIZE);
            contentStream.moveTextPositionByAmount(ITEM_USAGE_OFFSET_X, -1 * ITEM_USAGE_OFFSET_Y);
            contentStream.drawString(Long.toString(usage.get(key)));
            rowHeight += ITEM_USAGE_OFFSET_Y;

            font = PDType1Font.COURIER;
            contentStream.setFont(font, FONT_SIZE);
            contentStream.moveTextPositionByAmount(ITEM_UNIT_OFFSET_X, ITEM_UNIT_OFFSET_Y);
            contentStream.drawString(unit.get(key));
            rowHeight += ITEM_UNIT_OFFSET_Y;

            font = PDType1Font.COURIER_BOLD;
            contentStream.setFont(font, FONT_SIZE);
            contentStream.moveTextPositionByAmount(ITEM_RATE_OFFSET_X, ITEM_RATE_OFFSET_Y);
            contentStream.drawString(prettyPrintRate(rate.get(key)));
            rowHeight += ITEM_RATE_OFFSET_Y;

            double cost = Math.round(usage.get(key) * rate.get(key) * 100.0) / 100.0; // rounds to 2 decimal places
            itemCost.put(key, cost);

            font = PDType1Font.COURIER_BOLD_OBLIQUE;
            contentStream.setFont(font, FONT_SIZE);
            contentStream.moveTextPositionByAmount(ITEM_COST_OFFSET_X, ITEM_COST_OFFSET_Y);
            contentStream.drawString(prettyPrintPrice(cost));
            contentStream.endText();

            rowHeight += ITEM_COST_OFFSET_Y;
            rowHeight += DELIMITER_PADDING;

            contentStream.setStrokingColor(Color.LIGHT_GRAY);
            contentStream.drawLine(x, y - rowHeight, TABLE_WIDTH, y - rowHeight);

            tableHeight = rowHeight;
            rowIndex++;
        }

        contentStream.setStrokingColor(Color.BLACK);
        contentStream.drawLine(x, y - tableHeight, TABLE_WIDTH, y - tableHeight);
        contentStream.drawLine(x, y - tableHeight, x, y);
        contentStream.drawLine(TABLE_WIDTH, y - tableHeight, TABLE_WIDTH, y);

        return tableHeight;
    }

    private static void drawItemizedDetailSummary(PDPageContentStream contentStream, int x, int y, HashMap<String, Double> itemCost, HashMap<String, Double> discount) throws IOException {
        double totalCost = 0;

        for (String key : itemCost.keySet()) {
            totalCost += itemCost.get(key);
        }

        PDType1Font font = PDType1Font.TIMES_BOLD;
        contentStream.setFont(font, 12);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(x, y);
        contentStream.drawString("Total Amount Due:");

        font = PDType1Font.TIMES_ITALIC;
        contentStream.setFont(font, 12);
        contentStream.moveTextPositionByAmount(200, 0);
        contentStream.drawString(prettyPrintPrice(totalCost) + " CHF");

        int itemIndex = 1;
        double discountedTotalCost = 0.0;

        for (String key : discount.keySet()) {
            if (itemIndex == 1) {
                contentStream.moveTextPositionByAmount(-200, -20);
            } else {
                contentStream.moveTextPositionByAmount(-200, -15);
            }

            Double itemDiscount = discount.get(key);
            font = PDType1Font.TIMES_BOLD;
            contentStream.setFont(font, 12);
            contentStream.drawString(key + " discount: ");
            contentStream.moveTextPositionByAmount(200, 0);
            font = PDType1Font.TIMES_ITALIC;
            contentStream.setFont(font, 12);
            contentStream.drawString(itemDiscount.toString() + " %");
            //applying the discount to individual costs
            Double usageCost = itemCost.get(key);
            if (!key.startsWith("overall")) {
                double discountedCost = Math.round(usageCost * ((100.00 - itemDiscount) / 100.00) * 100.0) / 100.0;
                discountedTotalCost += discountedCost;
                //System.out.println(key + ", usage-cost: " + usageCost.doubleValue() + ", discount: " + itemDiscount.doubleValue() + ", discounted-price: " + discountedCost);
            }

            itemIndex++;
        }

        //now apply the final overall discount on top
        Double itemDiscount = discount.get("overall");
        discountedTotalCost = Math.round(discountedTotalCost * ((100.00 - itemDiscount) / 100.00) * 100.0) / 100.0;

        contentStream.endText();
        contentStream.drawLine(x, y - (itemIndex * 15), TABLE_WIDTH, y - (itemIndex * 15));
        font = PDType1Font.COURIER_BOLD;
        contentStream.setFont(font, 14);
        contentStream.beginText();
        contentStream.moveTextPositionByAmount(280, y - ((itemIndex + 1) * 15));
        contentStream.setNonStrokingColor(Color.orange);
        contentStream.drawString("Grand Amount Due:");
        contentStream.moveTextPositionByAmount(200, 0);
        contentStream.drawString(prettyPrintPrice(discountedTotalCost) + " CHF");
        contentStream.endText();
    }

    private static String prettyPrintRate(double rate) {
        NumberFormat formatter = new DecimalFormat("0.##########");
        return formatter.format(rate);
    }

    private static String prettyPrintPrice(double rate) {
        NumberFormat formatter = new DecimalFormat("0.##");
        return formatter.format(rate);
    }

    private static String ellipsis(String s, int maxLength) {
        if (s == null) {
            return null;
        }

        if (s.length() < maxLength) {
            return s;
        }

        return s.substring(0, maxLength - 3) + "...";
    }
}
