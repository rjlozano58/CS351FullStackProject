# -*- coding: utf-8 -*-
"""
Trie data structure taken from second project with added
methods for autocomplete use case
"""

class Node:
    def __init__(self,ch=0,isWord=False):
        self.ch = ch
        self.isWord = isWord
        self.children = {}
        
class Trie:

    """ A class for the Trie """
    def __init__ (self):
        self.word_count = 0
        self.root = Node()
    
    # reads in filename and inserts all words into trie data structure
    def getFromFile(self,filename: str) -> bool:
        try:
            with open(filename,'r') as file_in:
                words = file_in.read()
                for word in words.split():
                    word_clean = word.strip().lower()

                    if word_clean.isalpha():
                        self.insert(word_clean)

                return True

        except Exception as e:
            return False
                
    # inserts given word into trie and increments number of words data member
    def insert(self,word: str) -> bool:
        cur_node = self.root
        for ch in word:

            if ch.lower() not in cur_node.children:
                cur_node.children[ch.lower()] = Node(ch.lower())

            cur_node = cur_node.children.get(ch.lower())

        if cur_node.isWord == True:
            return False
        else:
            self.word_count += 1
            cur_node.isWord = True
            return True
    
    # parses trie for word and returns true if final nodes isWord data member is true
    def search(self,word:str) -> bool:
        cur_node = self.root
        for ch in word:
            if ch.lower() not in cur_node.children:
                return False
            else:
                cur_node = cur_node.children[ch.lower()]
        return cur_node.isWord

    # "removes" word from trie through setting isWord for final character to false
    def remove(self,word:str) -> bool:
        cur_node = self.root
        for ch in word:
            if ch.lower() not in cur_node.children:
                return False
            else:
                cur_node = cur_node.children[ch.lower()]
        if cur_node.isWord:
            cur_node.isWord = False
            self.word_count -= 1
            return True
        else:
            return False
    
    # sets data members to default values
    def clear(self) -> bool:
        if self.word_count == 0:
            return False
        self.word_count = 0
        self.root = Node()
        return True
    
    # getter for number of words in trie
    def wordCount(self) -> int:
        return self.word_count
    
    # creates an array of strings of words in the trie using helper function
    def words(self) -> [str]:
        cur_node = self.root
        wordsList = []
        for char in cur_node.children:
            self.wordsHelper(cur_node.children[char],char,wordsList)
        return sorted(wordsList)

    # recursively builds the array for words method
    def wordsHelper(self, curNode, curString, wordList:[str]):
        if curNode.isWord:
            wordList.append(curString)

        for char in curNode.children:
            self.wordsHelper(curNode.children[char],curString + char,wordList)

    def search_prefix(self, prefix: str) -> [str]:
        cur_node = self.root
        prefix = prefix.strip().lower()

        for ch in prefix:
            if ch not in cur_node.children:
                return []
            else:
                cur_node = cur_node.children[ch]
        
        autocomplete_results = []

        self.wordsHelper(cur_node, prefix, autocomplete_results)

        return autocomplete_results
            