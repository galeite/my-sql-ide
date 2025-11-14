import os
import re

def format_key_words( query:str ) -> str:
    # Lista de palavras-chave SQL
    sql_keywords = [
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
        'DROP', 'ALTER', 'TABLE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
        'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
        'DISTINCT', 'AS', 'ON', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
        'IS', 'NULL', 'TRUE', 'FALSE', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN'
    ]

    # Ordena por comprimento (maior primeiro) para evitar substituições parciais
    sql_keywords.sort(key=len, reverse=True)
    
    formatted_sql = query
    
    for keyword in sql_keywords:
        # Usa regex para substituir apenas palavras completas
        pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
        formatted_sql = re.sub(pattern, keyword, formatted_sql, flags=re.IGNORECASE)
    
    return formatted_sql

def format_new_line_after_special_word( query:str ) -> str:
    pre_nl_sql_keywords = [
        'FROM', 'JOIN',
        'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'UNION',
        'ON', 'AND', 'OR'
    ]

    pos_nl_sql_keywords = [
        'SELECT', 'WHERE'
    ]

    formatted_sql = query

    for keyword in pre_nl_sql_keywords:
        parts = formatted_sql.split( keyword )
        stripped_parts = [part.strip() for part in parts]
        formatted_sql = ('\n'+keyword+' ').join(stripped_parts)

    for keyword in pos_nl_sql_keywords:
        parts = formatted_sql.split( keyword )
        stripped_parts = [part.strip() for part in parts]
        formatted_sql = (keyword+'\n').join(stripped_parts)

    return formatted_sql

def format_comma( query:str ) -> str:
    parts = query.split(',')
    stripped_parts = [part.strip() for part in parts]
    formatted_sql = '\n,'.join(stripped_parts)

    return formatted_sql

def format_sql( query:str ) -> str:
    
    formatted_sql = query

    formatted_sql = format_key_words( formatted_sql )

    formatted_sql = format_comma( formatted_sql )

    formatted_sql = format_new_line_after_special_word( formatted_sql )
    
    return formatted_sql