import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('ny-police-complaints.csv')

df['year_received'] = pd.to_datetime(df['year_received'], format='%Y')

plt.figure(figsize=(14, 8))
sns.heatmap(pd.crosstab(df['mos_ethnicity'], df['complainant_ethnicity']), cmap='viridis', annot=True, fmt='d', cbar_kws={'label': 'Number of Complaints'}, linewidths=.5)

plt.title('NYPD Complaints: Unveiling Trends in Officer and Complainant Racism')
plt.xlabel('Complainant Ethnicity')
plt.ylabel('Officer Ethnicity')
plt.show()







