"use client";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { ExpandMoreRounded } from "@mui/icons-material";
import { BRAND, faqs } from "@/lib/marketing/landing-content";

export function FaqSection() {
  return (
    <Box component="section" id="faq" sx={{ py: { xs: 8, md: 12 }, bgcolor: "#ffffff" }}>
      <Container maxWidth="md">
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            sx={{
              color: BRAND.primary,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Frequently asked questions
          </Typography>
          <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 40 }, color: BRAND.ink }}>
            Everything you need to know
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {faqs.map((faq) => (
            <Accordion
              key={faq.question}
              disableGutters
              elevation={0}
              square={false}
              sx={{
                border: "1px solid",
                borderColor: BRAND.border,
                borderRadius: "12px !important",
                bgcolor: "#ffffff",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRounded />}
                sx={{ px: 3, py: 1, "& .MuiAccordionSummary-content": { my: 1.5 } }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 16.5, color: BRAND.ink }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5, pt: 0 }}>
                <Typography sx={{ color: BRAND.body, fontSize: 15.5, lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
