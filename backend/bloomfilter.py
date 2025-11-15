'''
bloom filter used rather than XOR filter for simplicity 
and historical standard for approsimate set membership checking
* https://arxiv.org/pdf/1912.08258
* https://en.wikipedia.org/wiki/Salt_%28cryptography%29
* https://www.geeksforgeeks.org/python/bloom-filters-introduction-and-python-implementation/
'''

class BloomFilter(object):
    
    def __init__(self, size=50000, hashCount = 3):
        self.size = size
        self.hashCount = hashCount
        self.bitArr = [0] * size

    def add(self, item):
        for idx in [self.h_add(item), self.h_djb(item), self.h_mult(item)]:
            self.bitArr[idx] = 1

        # for idx in self.h_add(item):
        #     self.bitArr[idx] = 1
        # for idx in self.h_djb(item):
        #     self.bitArr[idx] = 1
        # for idx in self.h_mult(item):
        #     self.bitArr[idx] = 1

    def lookup(self, lookupVal):
        a, b, c = self.h_add(lookupVal), self.h_djb(lookupVal), self.h_mult(lookupVal)    
        return self.bitArr[a] == 1 and self.bitArr[b] == 1 and self.bitArr[c] == 1

    def h_add(self, s:str) -> int:
        hash = 0
        for i in range(len(s)):
            hash = hash + ord(s[i])
            hash %= self.size
        
        return hash
    
    def h_djb(self, s:str) -> int:
        hash = 5381 # arbitrary

        for c in s:
            hash = ((hash << 5) + hash) + ord(c)
            hash %= self.size
        return hash 
    
    def h_mult(self, s:str) -> int:
        hash = 6942067
        for c in s:
            hash = (hash * 31 + ord(c))
            hash %= self.size
        return hash


    # nondeterministic between session runs
    def h_python(self, s:str) -> int:
        return hash(s) % self.size
        

if __name__ == "__main__":
    alex = BloomFilter() 