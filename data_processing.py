from pandas import read_excel, cut, qcut, read_json, read_csv
from matplotlib.pyplot import plot, xlabel, ylabel, show

data = read_excel(io = 'Assets\\Unprocessed\\Data.xlsx',
                     sheet_name = 'Data',
                     usecols = ['countrycode',
                                'country',
                                'year',
                                'rgdpe',
                                'rgdpo',
                                'pop',
                                'emp',
                                'avh']).drop_duplicates().dropna()
data = data[data['year'] > 1994]

# data.to_json('Assets\\Data.js', orient = 'records')

# print(cut(data['avh'], 7, retbins = True)[1])

# print(qcut(data['pop'] * 1000000, 7, retbins = True)[1])

# print(qcut(data['emp'] * 1000000, 7, retbins = True)[1])

# print(cut(data['rgdpe'] / data['pop'], 7, retbins = True)[1])

# print(cut(data['rgdpo'] / data['pop'], 7, retbins = True)[1])

# print(cut(data['emp'] / data['pop'] * 100, 7, retbins = True)[1])

# data = read_json('Assets\\data.js', orient = 'records')
# data.to_csv('Assets\\temp.csv')

# data = read_csv('Assets\\temp.csv')

print(min(data['avh']))
print(max(data['avh']))