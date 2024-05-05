from pandas import read_excel, cut, qcut

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

print(cut(data['emp'] / data['pop'] * 100, 7, retbins = True)[1])