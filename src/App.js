import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  Input,
  Image,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  IconButton,
  Flex,
  Text,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stack,
  Divider,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiSearch, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: true,
            }
          }
        );
        setCoins(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCoinChart = async (coinId) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: '7',
          }
        }
      );
      
      const prices = response.data.prices;
      const chartData = {
        labels: prices.map(price => new Date(price[0]).toLocaleDateString()),
        datasets: [
          {
            label: 'Fiyat (USD)',
            data: prices.map(price => price[1]),
            borderColor: '#3182ce',
            backgroundColor: 'rgba(49, 130, 206, 0.1)',
            fill: true,
          },
        ],
      };
      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleCoinClick = async (coin) => {
    setSelectedCoin(coin);
    await fetchCoinChart(coin.id);
    onOpen();
  };

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(search.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const topGainers = [...coins]
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 3);

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          <Heading size="xl" mb={2}>Kripto Para Takipçisi</Heading>
          
          {/* Top Gainers Section */}
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6} w="full">
            {topGainers.map((coin) => (
              <Card key={coin.id} bg={bgColor} borderWidth="1px" borderColor={borderColor}>
                <CardBody>
                  <Stack spacing={4}>
                    <Flex align="center">
                      <Image src={coin.image} alt={coin.name} boxSize="32px" mr={2} />
                      <Box>
                        <Heading size="sm">{coin.name}</Heading>
                        <Text color="gray.500">{coin.symbol.toUpperCase()}</Text>
                      </Box>
                    </Flex>
                    <Divider />
                    <Text fontSize="2xl" fontWeight="bold">
                      ${coin.current_price.toLocaleString()}
                    </Text>
                    <Badge colorScheme="green" alignSelf="start">
                      +{coin.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>

          {/* Search Section */}
          <Flex w="full" align="center">
            <Input
              placeholder="Kripto para ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="lg"
              bg={bgColor}
              borderRadius="full"
              pr="4.5rem"
            />
            <IconButton
              aria-label="Search"
              icon={<FiSearch />}
              size="lg"
              ml="-4.5rem"
              borderRadius="full"
              colorScheme="blue"
            />
          </Flex>

          {/* Coins Table */}
          <TableContainer width="100%" bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Logo</Th>
                  <Th>İsim</Th>
                  <Th>Sembol</Th>
                  <Th>Fiyat</Th>
                  <Th>24s Değişim</Th>
                  <Th>Piyasa Değeri</Th>
                  <Th>Grafik</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredCoins.map(coin => (
                  <Tr key={coin.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} cursor="pointer" onClick={() => handleCoinClick(coin)}>
                    <Td>
                      <Image src={coin.image} alt={coin.name} boxSize="24px" />
                    </Td>
                    <Td fontWeight="medium">{coin.name}</Td>
                    <Td>{coin.symbol.toUpperCase()}</Td>
                    <Td>${coin.current_price.toLocaleString()}</Td>
                    <Td color={coin.price_change_percentage_24h > 0 ? 'green.500' : 'red.500'}>
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </Td>
                    <Td>${coin.market_cap.toLocaleString()}</Td>
                    <Td>
                      <IconButton
                        aria-label="View chart"
                        icon={<FiTrendingUp />}
                        variant="ghost"
                        colorScheme="blue"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>

        {/* Chart Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedCoin && (
                <Flex align="center">
                  <Image src={selectedCoin.image} alt={selectedCoin.name} boxSize="24px" mr={2} />
                  {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()})
                </Flex>
              )}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {chartData && <Line data={chartData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: '7 Günlük Fiyat Grafiği',
                  },
                },
              }} />}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}

export default App;
