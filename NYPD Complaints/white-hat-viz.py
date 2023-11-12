import pandas as pd 
import matplotlib.pyplot as plt

df = pd.read_csv('ny-police-complaints.csv')

df['year_received'] = pd.to_datetime(df['year_received'], format='%Y')

plt.figure(figsize=(12, 6))
for complaint_type in df['fado_type'].unique():
    type_data = df[df['fado_type'] == complaint_type]
    type_data_grouped = type_data.groupby(type_data['year_received'].dt.year).size()
    plt.plot(type_data_grouped.index, type_data_grouped.values, label=complaint_type)

plt.title('Trend of NYPD Complaints Over the Years (Color-Coded by Type)')
plt.xlabel('Year')
plt.ylabel('Number of Complaints')
plt.legend()
plt.show()