library(readr)
library(dplyr)
library(stringr)

# 1) Read your dataset, skipping first two rows
df_raw <- read_csv("~/Desktop/234results_10-29.csv", skip = 2)

# 2) Clean column names to only keep the ImportId value
names(df_raw) <- str_extract(names(df_raw), '(?<="ImportId":").+?(?=")')

# 3) Remove rows where finished == FALSE
df_clean <- df_raw %>%
  filter(finished == TRUE)

# 4) Identify major from QID41 or fallback fields
# These are the possible major report fields (per your message):
major_sources <- c("QID41", "QID9", "QID15", "QID31", "QID17")

df_clean <- df_clean %>%
  mutate(
    College = coalesce(!!!syms(major_sources)),  # use first non-NA major field
    College = if_else(is.na(College) | College == "", "Other", College)
  )

# 5) Convert Yes/No to TRUE/FALSE for switch + fit
df_clean <- df_clean %>%
  mutate(
    would_switch = case_when(
      QID11 == "Yes" ~ TRUE,
      QID11 == "No" ~ FALSE,
      TRUE ~ NA
    ),
    fit = case_when(
      QID19 == "Yes" ~ TRUE,
      QID19 == "No" ~ FALSE,
      TRUE ~ NA
    )
  )

# 6) Standardize MBTI case
df_clean <- df_clean %>%
  mutate(mbti = toupper(QID7))

# 7) Add constants (everyone is BYU + enrolled = TRUE)
df_export <- df_clean %>%
  mutate(
    school = "BYU",
    enrolled = TRUE
  ) %>%
  select(
    school,
    enrolled,
    mbti,
    college = College,
    fit,
    would_switch
  )

# 8) Write final Supabase-ready CSV
write_csv(df_export, "~/Desktop/mbti_college_responses_for_supabase.csv")
