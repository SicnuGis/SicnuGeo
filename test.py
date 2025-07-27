
def solution(A):
    # write your code in Python 3.6
    A.sort()
    for i in range(len(A)-1):
        if A[i] == A[i+1]:
            continue
        if A[i] + 1 != A[i+1]:
            return A[i] + 1
    return A[0] - 1