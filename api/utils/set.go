package utils

// Structure with UNORDERED but UNIQUE data
type Set[T comparable] struct {
	data map[T]struct{}
}

func (s *Set[T]) Count() int {
	return len(s.data)
}

func (s *Set[T]) Add(something T) {
	_, ok := s.data[something]
	if !ok {
		s.data[something] = struct{}{}
	}
}

func (s *Set[T]) Remove(something T) {
	_, ok := s.data[something]
	if ok {
		delete(s.data, something)
	}
}

func (s *Set[T]) GetAll() []T {
	keys := []T{}
	for key := range s.data {
		keys = append(keys, key)
	}

	return keys
}

func NewSet[T comparable]() Set[T] {
	return Set[T]{}
}

func NewSetWithData[T comparable](initialData []T) Set[T] {
	set := Set[T]{}

	for _, x := range initialData {
		set.Add(x)
	}

	return set
}
